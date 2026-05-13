import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { flushPromises } from "@vue/test-utils";
import PrikazAukcije, { validateAutoBidAmount } from "../PrikazAukcije.vue";

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

vi.mock("socket.io-client", () => ({
  io: vi.fn(() => ({
    emit: vi.fn(),
    on: vi.fn(),
    disconnect: vi.fn(),
  })),
}));

vi.mock("jwt-decode", () => ({
  jwtDecode: vi.fn(() => ({ id: 42 })),
}));

import axios from "axios";

// ── Helpers ───────────────────────────────────────────────────────────────────

const FAKE_TOKEN = "fake.jwt.token";
const ITEM_STUB = {
  id_predmeta: 1,
  naziv_predmeta: "Test predmet",
  opis_predmeta: "Opis",
  pocetna_cijena: 100,
  trenutna_cijena: 100,
  vrijeme_pocetka: "2024-01-01T10:00:00",
  vrijeme_zavrsetka: "2024-01-02T10:00:00",
  slike: [],
};

const mockNotify = vi.fn();

function createWrapper(dataOverrides = {}) {
  return shallowMount(PrikazAukcije, {
    global: {
      mocks: {
        $q: { notify: mockNotify },
        $route: { query: { id_predmeta: "1" } },
      },
    },
    data() {
      return {
        item: { ...ITEM_STUB },
        autoBidStatus: null,
        autoBidForm: { maksimalni_iznos: null },
        autoBidError: null,
        autoBidLoading: false,
        ponude: [],
        showDialog: false,
        odabranaCijena: "",
        prices: [],
        pratim: false,
        showSingleImage: false,
        socket: null,
        ...dataOverrides,
      };
    },
  });
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.spyOn(Storage.prototype, "getItem").mockReturnValue(FAKE_TOKEN);

  // Default: all API calls resolve silently
  axios.get.mockResolvedValue({ data: null });
  axios.post.mockResolvedValue({ data: { error: false } });
  axios.put.mockResolvedValue({ data: { error: false } });

  mockNotify.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── 1. validateAutoBidAmount (pure function) ──────────────────────────────────

describe("validateAutoBidAmount", () => {
  it("rejects null", () => {
    expect(validateAutoBidAmount(null, 100)).not.toBeNull();
  });

  it("rejects empty string", () => {
    expect(validateAutoBidAmount("", 100)).not.toBeNull();
  });

  it("rejects NaN", () => {
    expect(validateAutoBidAmount(NaN, 100)).not.toBeNull();
  });

  it("rejects zero", () => {
    expect(validateAutoBidAmount(0, 100)).not.toBeNull();
  });

  it("rejects negative value", () => {
    expect(validateAutoBidAmount(-5, 100)).not.toBeNull();
  });

  it("rejects amount equal to current price", () => {
    expect(validateAutoBidAmount(100, 100)).not.toBeNull();
  });

  it("rejects amount lower than current price", () => {
    expect(validateAutoBidAmount(50, 100)).not.toBeNull();
  });

  it("accepts amount strictly greater than current price", () => {
    expect(validateAutoBidAmount(101, 100)).toBeNull();
  });

  it("accepts decimal amount greater than current price", () => {
    expect(validateAutoBidAmount(100.01, 100)).toBeNull();
  });
});

// ── 2. Component renders auto-bid input ──────────────────────────────────────

describe("Auto-bid input rendering", () => {
  it("renders the auto-bid input when authenticated", () => {
    const wrapper = createWrapper();
    // shallowMount stubs child components; check for the stub element
    const input = wrapper.find('[data-testid="auto-bid-input"]');
    expect(input.exists()).toBe(true);
  });

  it("renders the save button", () => {
    const wrapper = createWrapper();
    const btn = wrapper.find('[data-testid="save-auto-bid-btn"]');
    expect(btn.exists()).toBe(true);
  });

  it("does NOT render the disable button when no auto-bid is active", () => {
    const wrapper = createWrapper({ autoBidStatus: null });
    const btn = wrapper.find('[data-testid="disable-auto-bid-btn"]');
    expect(btn.exists()).toBe(false);
  });

  it("renders the disable button when an active auto-bid exists", () => {
    const wrapper = createWrapper({
      autoBidStatus: { maksimalni_iznos: 150, aktivan: 1, limit_dosegnut: 0 },
    });
    const btn = wrapper.find('[data-testid="disable-auto-bid-btn"]');
    expect(btn.exists()).toBe(true);
  });
});

// ── 3. Status chip labels ─────────────────────────────────────────────────────

describe("statusLabel computed", () => {
  it('shows "Nije postavljen" when autoBidStatus is null', () => {
    const wrapper = createWrapper({ autoBidStatus: null });
    expect(wrapper.vm.statusLabel).toBe("Nije postavljen");
  });

  it('shows "Aktivan" when active and limit not reached', () => {
    const wrapper = createWrapper({
      autoBidStatus: { maksimalni_iznos: 150, aktivan: 1, limit_dosegnut: 0 },
    });
    expect(wrapper.vm.statusLabel).toBe("Aktivan");
  });

  it('shows "Onemogućen" when disabled', () => {
    const wrapper = createWrapper({
      autoBidStatus: { maksimalni_iznos: 150, aktivan: 0, limit_dosegnut: 0 },
    });
    expect(wrapper.vm.statusLabel).toBe("Onemogućen");
  });

  it('shows "Limit dosegnut" when limit is reached', () => {
    const wrapper = createWrapper({
      autoBidStatus: { maksimalni_iznos: 150, aktivan: 1, limit_dosegnut: 1 },
    });
    expect(wrapper.vm.statusLabel).toBe("Limit dosegnut");
  });
});

// ── 4. spremiAutoBid — validation blocks submission ───────────────────────────

describe("spremiAutoBid validation", () => {
  it("sets autoBidError and does not call axios when amount is empty", async () => {
    const wrapper = createWrapper({ autoBidForm: { maksimalni_iznos: null } });
    await wrapper.vm.spremiAutoBid();
    expect(wrapper.vm.autoBidError).not.toBeNull();
    expect(axios.post).not.toHaveBeenCalled();
    expect(axios.put).not.toHaveBeenCalled();
  });

  it("sets autoBidError when amount <= currentPrice", async () => {
    const wrapper = createWrapper({
      item: { ...ITEM_STUB, trenutna_cijena: 100 },
      autoBidForm: { maksimalni_iznos: 100 },
    });
    await wrapper.vm.spremiAutoBid();
    expect(wrapper.vm.autoBidError).not.toBeNull();
    expect(axios.post).not.toHaveBeenCalled();
  });
});

// ── 5. POST when no auto-bid exists ──────────────────────────────────────────

describe("spremiAutoBid — POST vs PUT", () => {
  it("calls POST /api/auto-bid when autoBidStatus is null", async () => {
    axios.post.mockResolvedValue({ data: { error: false, created: true } });
    axios.get.mockResolvedValue({ data: null }); // dohvatiAutoBid returns null

    const wrapper = createWrapper({
      autoBidStatus: null,
      autoBidForm: { maksimalni_iznos: 200 },
      item: { ...ITEM_STUB, trenutna_cijena: 100 },
    });

    await wrapper.vm.spremiAutoBid();
    await flushPromises();

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/auto-bid"),
      expect.objectContaining({ id_predmeta: "1", maksimalni_iznos: 200 }),
      expect.any(Object),
    );
    expect(axios.put).not.toHaveBeenCalledWith(
      expect.stringContaining("/auto-bid"),
      expect.anything(),
      expect.anything(),
    );
  });

  it("calls PUT /api/auto-bid when autoBidStatus already exists", async () => {
    axios.put.mockResolvedValue({ data: { error: false } });
    axios.get.mockResolvedValue({
      data: { maksimalni_iznos: 200, aktivan: 1, limit_dosegnut: 0 },
    });

    const wrapper = createWrapper({
      autoBidStatus: { maksimalni_iznos: 150, aktivan: 1, limit_dosegnut: 0 },
      autoBidForm: { maksimalni_iznos: 200 },
      item: { ...ITEM_STUB, trenutna_cijena: 100 },
    });

    await wrapper.vm.spremiAutoBid();
    await flushPromises();

    expect(axios.put).toHaveBeenCalledWith(
      expect.stringContaining("/auto-bid"),
      expect.objectContaining({ id_predmeta: "1", maksimalni_iznos: 200 }),
      expect.any(Object),
    );
    expect(axios.post).not.toHaveBeenCalled();
  });
});

// ── 6. Disable button calls disable endpoint ─────────────────────────────────

describe("onemoguciAutoBid", () => {
  it("calls PUT /api/auto-bid/disable with the correct payload", async () => {
    axios.put.mockResolvedValue({ data: { error: false } });
    axios.get.mockResolvedValue({ data: null }); // after disable, status is null

    const wrapper = createWrapper({
      autoBidStatus: { maksimalni_iznos: 150, aktivan: 1, limit_dosegnut: 0 },
    });

    await wrapper.vm.onemoguciAutoBid();
    await flushPromises();

    expect(axios.put).toHaveBeenCalledWith(
      expect.stringContaining("/auto-bid/disable"),
      expect.objectContaining({ id_predmeta: "1" }),
      expect.any(Object),
    );
  });

  it("shows a success notification after disabling", async () => {
    axios.put.mockResolvedValue({ data: { error: false } });
    axios.get.mockResolvedValue({ data: null });

    const wrapper = createWrapper({
      autoBidStatus: { maksimalni_iznos: 150, aktivan: 1, limit_dosegnut: 0 },
    });

    await wrapper.vm.onemoguciAutoBid();
    await flushPromises();

    expect(mockNotify).toHaveBeenCalledWith(
      expect.objectContaining({ type: "positive" }),
    );
  });
});

// ── 7. Buttons disabled during loading ───────────────────────────────────────

describe("loading state", () => {
  it("sets autoBidLoading = true while request is in flight", async () => {
    // Delay the resolution so we can inspect mid-flight state
    let resolveRequest;
    axios.post.mockReturnValue(
      new Promise((res) => {
        resolveRequest = res;
      }),
    );

    const wrapper = createWrapper({
      autoBidStatus: null,
      autoBidForm: { maksimalni_iznos: 200 },
      item: { ...ITEM_STUB, trenutna_cijena: 100 },
    });

    const promise = wrapper.vm.spremiAutoBid();
    expect(wrapper.vm.autoBidLoading).toBe(true);

    resolveRequest({ data: {} });
    await promise;
    await flushPromises();
    expect(wrapper.vm.autoBidLoading).toBe(false);
  });
});

// ── 8. API error shows user-friendly message ─────────────────────────────────

describe("API error handling", () => {
  it("shows backend error message via $q.notify on POST failure", async () => {
    axios.post.mockRejectedValue({
      response: { data: { message: "Auto-bid nije ispravan." } },
    });

    const wrapper = createWrapper({
      autoBidStatus: null,
      autoBidForm: { maksimalni_iznos: 200 },
      item: { ...ITEM_STUB, trenutna_cijena: 100 },
    });

    await wrapper.vm.spremiAutoBid();
    await flushPromises();

    expect(mockNotify).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "negative",
        message: "Auto-bid nije ispravan.",
      }),
    );
  });

  it("shows fallback message when error has no response body", async () => {
    axios.post.mockRejectedValue(new Error("Network Error"));

    const wrapper = createWrapper({
      autoBidStatus: null,
      autoBidForm: { maksimalni_iznos: 200 },
      item: { ...ITEM_STUB, trenutna_cijena: 100 },
    });

    await wrapper.vm.spremiAutoBid();
    await flushPromises();

    expect(mockNotify).toHaveBeenCalledWith(
      expect.objectContaining({ type: "negative" }),
    );
  });

  it("sets autoBidError so inline message is visible", async () => {
    axios.post.mockRejectedValue({
      response: { data: { message: "Neovlašteno." } },
    });

    const wrapper = createWrapper({
      autoBidStatus: null,
      autoBidForm: { maksimalni_iznos: 200 },
      item: { ...ITEM_STUB, trenutna_cijena: 100 },
    });

    await wrapper.vm.spremiAutoBid();
    await flushPromises();

    expect(wrapper.vm.autoBidError).toBe("Neovlašteno.");
  });
});
