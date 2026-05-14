"use strict";

const REALTIME_ROOMS = {
  predmet: (id_predmeta) => `predmet_${id_predmeta}`,
};

const REALTIME_CLIENT_EVENTS = {
  joinPredmet: "join_predmet",
  leavePredmet: "leave_predmet",
};

const REALTIME_SERVER_EVENTS = {
  cijenaAzurirana: "cijena_azurirana",
};

function createCijenaAzuriranaPayload({
  id_predmeta,
  trenutna_cijena,
  id_ponude,
  id_korisnika,
  vrijeme_ponude,
}) {
  return {
    id_predmeta,
    trenutna_cijena,
    id_ponude,
    id_korisnika,
    vrijeme_ponude,
  };
}

module.exports = {
  REALTIME_ROOMS,
  REALTIME_CLIENT_EVENTS,
  REALTIME_SERVER_EVENTS,
  createCijenaAzuriranaPayload,
};
