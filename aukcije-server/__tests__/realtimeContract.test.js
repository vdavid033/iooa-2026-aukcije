"use strict";

const {
  REALTIME_ROOMS,
  REALTIME_CLIENT_EVENTS,
  REALTIME_SERVER_EVENTS,
  createCijenaAzuriranaPayload,
} = require("../realtimeContract");

describe("realtimeContract", () => {
  test("defines predmet room name", () => {
    expect(REALTIME_ROOMS.predmet(12)).toBe("predmet_12");
  });

  test("defines websocket event names", () => {
    expect(REALTIME_CLIENT_EVENTS.joinPredmet).toBe("join_predmet");
    expect(REALTIME_CLIENT_EVENTS.leavePredmet).toBe("leave_predmet");
    expect(REALTIME_SERVER_EVENTS.cijenaAzurirana).toBe("cijena_azurirana");
  });

  test("creates cijena_azurirana payload", () => {
    expect(
      createCijenaAzuriranaPayload({
        id_predmeta: 1,
        trenutna_cijena: 120,
        id_ponude: 5,
        id_korisnika: 9,
        vrijeme_ponude: "2026-05-14 12:30:00",
      }),
    ).toEqual({
      id_predmeta: 1,
      trenutna_cijena: 120,
      id_ponude: 5,
      id_korisnika: 9,
      vrijeme_ponude: "2026-05-14 12:30:00",
    });
  });
});
