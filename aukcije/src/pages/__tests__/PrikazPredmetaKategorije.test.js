import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { shallowMount, flushPromises } from "@vue/test-utils";
import PrikazPredmetaKategorije from "../PrikazPredmetaKategorije.vue";

const { mockSocket } = vi.hoisted(() => ({
  mockSocket: {
    connected: false,
    connect: vi.fn(),
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
}));

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("socket.io-client", () => ({
  io: vi.fn(() => mockSocket),
}));

vi.mock("jwt-decode", () => ({
  jwtDecode: vi.fn(() => ({ id: 5 })),
}));

import axios from "axios";

const ITEMS = [
  {
    id_predmeta: 1,
    naziv_predmeta: "Sat",
    pocetna_cijena: 100,
    trenutna_cijena: 100,
    vrijeme_pocetka: "2026-05-14T10:00:00",
    vrijeme_zavrsetka: "2026-05-15T10:00:00",
    preostalo_vrijeme: "12:00:00",
  },
  {
    id_predmeta: 2,
    naziv_predmeta: "Knjiga",
    pocetna_cijena: 50,
    trenutna_cijena: 50,
    vrijeme_pocetka: "2026-05-14T10:00:00",
    vrijeme_zavrsetka: "2026-05-15T10:00:00",
    preostalo_vrijeme: "12:00:00",
  },
];

const mockNotify = vi.fn();

function createWrapper() {
  return shallowMount(PrikazPredmetaKategorije, {
    global: {
      renderStubDefaultSlot: true,
      mocks: {
        $q: { notify: mockNotify },
        $route: { query: { id_kategorije: "3" } },
        $router: { push: vi.fn() },
      },
      stubs: [
        "q-card",
        "q-img",
        "q-input",
        "q-item",
        "q-item-section",
        "q-select",
        "q-separator",
      ],
    },
  });
}

function getCijenaAzuriranaHandler() {
  const call = mockSocket.on.mock.calls.find(
    ([eventName]) => eventName === "cijena_azurirana",
  );

  return call?.[1];
}

beforeEach(() => {
  mockSocket.connected = false;
  mockSocket.connect.mockClear();
  mockSocket.emit.mockClear();
  mockSocket.on.mockClear();
  mockSocket.off.mockClear();
  mockNotify.mockClear();

  vi.spyOn(Storage.prototype, "getItem").mockReturnValue("token");
  axios.get.mockResolvedValue({ data: ITEMS.map((item) => ({ ...item })) });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PrikazPredmetaKategorije realtime cijena", () => {
  it("updates displayed current price when cijena_azurirana is received", async () => {
    const wrapper = createWrapper();
    await flushPromises();

    getCijenaAzuriranaHandler()({
      id_predmeta: 1,
      trenutna_cijena: 150,
      id_korisnika: 9,
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.items[0].trenutna_cijena).toBe(150);
    expect(wrapper.text()).toContain("Trenutna cijena: 150$");
  });

  it("ignores cijena_azurirana for items that are not displayed", async () => {
    const wrapper = createWrapper();
    await flushPromises();

    getCijenaAzuriranaHandler()({
      id_predmeta: 99,
      trenutna_cijena: 999,
      id_korisnika: 9,
    });

    expect(wrapper.vm.items[0].trenutna_cijena).toBe(100);
    expect(mockNotify).not.toHaveBeenCalled();
  });

  it("does not notify when the current user submitted the bid", async () => {
    createWrapper();
    await flushPromises();

    getCijenaAzuriranaHandler()({
      id_predmeta: 1,
      trenutna_cijena: 150,
      id_korisnika: 5,
    });

    expect(mockNotify).not.toHaveBeenCalled();
  });

  it("removes cijena_azurirana listener and leaves rooms on unmount", async () => {
    const wrapper = createWrapper();
    await flushPromises();

    const handler = getCijenaAzuriranaHandler();
    wrapper.unmount();

    expect(mockSocket.off).toHaveBeenCalledWith("cijena_azurirana", handler);
    expect(mockSocket.emit).toHaveBeenCalledWith("leave_predmet", 1);
    expect(mockSocket.emit).toHaveBeenCalledWith("leave_predmet", 2);
  });
});
