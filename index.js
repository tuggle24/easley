import { createSocket } from "./lib/create-socket.js";

export function createIo(options = {}) {
  return createSocket("io", options);
}

export function createWebSocket(options = {}) {
  return createSocket("websocket", options);
}

export function createSock(options = {}) {
  return createSocket("sock", options);
}
