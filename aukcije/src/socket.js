import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

export const SOCKET_EVENTS = {
  joinPredmet: "join_predmet",
  leavePredmet: "leave_predmet",
  cijenaAzurirana: "cijena_azurirana",
};

const socket = io(SOCKET_URL, {
  autoConnect: false,
});

export default socket;
