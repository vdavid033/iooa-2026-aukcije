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

  it('shows "Ugašen" when disabled', () => {
    const wrapper = createWrapper({
      autoBidStatus: { maksimalni_iznos: 150, aktivan: 0, limit_dosegnut: 0 },
    });
    expect(wrapper.vm.statusLabel).toBe("Ugašen");
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

// ── 9. Loading skeleton for status fetch ─────────────────────────────────────

describe("auto-bid status loading skeleton", () => {
  it("shows skeleton element when autoBidStatusLoading is true", async () => {
    const wrapper = createWrapper();
    await flushPromises();
    wrapper.vm.autoBidStatusLoading = true;
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-testid="auto-bid-status-loading"]').exists()).toBe(true);
  });

  it("hides skeleton and shows content when loading is complete", async () => {
    const wrapper = createWrapper();
    await flushPromises();
    expect(wrapper.find('[data-testid="auto-bid-status-loading"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="auto-bid-input"]').exists()).toBe(true);
  });
});

// ── 10. Auto-bid limit display ────────────────────────────────────────────────

describe("auto-bid limit display", () => {
  it("shows limit element when auto-bid is active", () => {
    const wrapper = createWrapper({
      autoBidStatus: { maksimalni_iznos: 250, aktivan: 1, limit_dosegnut: 0 },
    });
    const el = wrapper.find('[data-testid="auto-bid-limit"]');
    expect(el.exists()).toBe(true);
    expect(el.text()).toContain("250.00");
  });

  it("does not show limit when no auto-bid is configured", () => {
    const wrapper = createWrapper({ autoBidStatus: null });
    expect(wrapper.find('[data-testid="auto-bid-limit"]').exists()).toBe(false);
  });

  it("formats a decimal string amount correctly (e.g. '150.5' → '150.50')", () => {
    const wrapper = createWrapper({
      autoBidStatus: { maksimalni_iznos: "150.5", aktivan: 1, limit_dosegnut: 0 },
    });
    const el = wrapper.find('[data-testid="auto-bid-limit"]');
    expect(el.text()).toContain("150.50");
  });

  it("shows limit when limit is reached (allows user to increase it)", () => {
    const wrapper = createWrapper({
      autoBidStatus: { maksimalni_iznos: 300, aktivan: 1, limit_dosegnut: 1 },
    });
    expect(wrapper.find('[data-testid="auto-bid-limit"]').exists()).toBe(true);
  });
});

// ── 11. Status message banners ────────────────────────────────────────────────

describe("status message banners", () => {
  it('shows "nije postavljen" banner when no auto-bid exists', () => {
    const wrapper = createWrapper({ autoBidStatus: null });
    const msg = wrapper.find('[data-testid="status-message"]');
    expect(msg.exists()).toBe(true);
    expect(msg.text()).toContain("nije postavljen");
  });

  it('shows "aktivan" banner when auto-bid is active and limit not reached', () => {
    const wrapper = createWrapper({
      autoBidStatus: { maksimalni_iznos: 150, aktivan: 1, limit_dosegnut: 0 },
    });
    const msg = wrapper.find('[data-testid="status-message"]');
    expect(msg.exists()).toBe(true);
    expect(msg.text()).toContain("aktivan");
  });

  it('shows "ugašen" banner when auto-bid is disabled', () => {
    const wrapper = createWrapper({
      autoBidStatus: { maksimalni_iznos: 150, aktivan: 0, limit_dosegnut: 0 },
    });
    const msg = wrapper.find('[data-testid="status-message"]');
    expect(msg.exists()).toBe(true);
    expect(msg.text()).toContain("ugašen");
  });

  it("shows limit-reached banner (not status-message) when limit is reached", () => {
    const wrapper = createWrapper({
      autoBidStatus: { maksimalni_iznos: 150, aktivan: 1, limit_dosegnut: 1 },
    });
    expect(wrapper.find('[data-testid="limit-banner"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="status-message"]').exists()).toBe(false);
  });
});

// ── 12. Status refresh after create / update / disable ───────────────────────

describe("dohvatiAutoBid refresh after operations", () => {
  it("calls dohvatiAutoBid after successful create", async () => {
    axios.post.mockResolvedValue({ data: { error: false, created: true } });
    axios.get.mockResolvedValue({
      data: { maksimalni_iznos: 200, aktivan: 1, limit_dosegnut: 0 },
    });

    const wrapper = createWrapper({
      autoBidStatus: null,
      autoBidForm: { maksimalni_iznos: 200 },
      item: { ...ITEM_STUB, trenutna_cijena: 100 },
    });
    await flushPromises();

    const spy = vi.spyOn(wrapper.vm, "dohvatiAutoBid");
    await wrapper.vm.spremiAutoBid();
    await flushPromises();

    expect(spy).toHaveBeenCalled();
  });

  it("calls dohvatiAutoBid after successful update", async () => {
    axios.put.mockResolvedValue({ data: { error: false } });
    axios.get.mockResolvedValue({
      data: { maksimalni_iznos: 300, aktivan: 1, limit_dosegnut: 0 },
    });

    const wrapper = createWrapper({
      autoBidStatus: { maksimalni_iznos: 200, aktivan: 1, limit_dosegnut: 0 },
      autoBidForm: { maksimalni_iznos: 300 },
      item: { ...ITEM_STUB, trenutna_cijena: 100 },
    });
    await flushPromises();

    const spy = vi.spyOn(wrapper.vm, "dohvatiAutoBid");
    await wrapper.vm.spremiAutoBid();
    await flushPromises();

    expect(spy).toHaveBeenCalled();
  });

  it("calls dohvatiAutoBid after successful disable", async () => {
    axios.put.mockResolvedValue({ data: { error: false } });
    axios.get.mockResolvedValue({ data: null });

    const wrapper = createWrapper({
      autoBidStatus: { maksimalni_iznos: 150, aktivan: 1, limit_dosegnut: 0 },
    });
    await flushPromises();

    const spy = vi.spyOn(wrapper.vm, "dohvatiAutoBid");
    await wrapper.vm.onemoguciAutoBid();
    await flushPromises();

    expect(spy).toHaveBeenCalled();
  });
});

// ── 13. Own-user-only limit exposure ─────────────────────────────────────────

describe("limit visibility — own user only", () => {
  it("shows limit display only when autoBidStatus is non-null (API returns only own data)", () => {
    // autoBidStatus comes from GET /api/auto-bid/:id which is JWT-scoped;
    // null means no auto-bid for this user → no limit shown
    const withStatus = createWrapper({
      autoBidStatus: { maksimalni_iznos: 500, aktivan: 1, limit_dosegnut: 0 },
    });
    expect(withStatus.find('[data-testid="auto-bid-limit"]').exists()).toBe(true);

    const noStatus = createWrapper({ autoBidStatus: null });
    expect(noStatus.find('[data-testid="auto-bid-limit"]').exists()).toBe(false);
  });
});
