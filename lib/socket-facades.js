import { mixin } from "./mixin";

export const createProxyForClient = (configuration) =>
  createProxyFor("client", configuration);

export const createProxyForServer = (configuration) =>
  createProxyFor("server", configuration);

export function createProxyFor(node, { socketType, ...configuration }) {
  switch (socketType) {
    case "io":
      return mixin(configuration, io[node]);
    case "WebSocket":
      return mixin(configuration, webSockets[node]);
  }
}

const webSockets = {
  client: { addEventListener, send },
  server: { addEventListener, send },
};

const io = {
  client: { on: addEventListener, emit, send },
  server: {
    send,
    emit,
    on: addEventListener,
    get broadcast() {
      return {
        emit: (event, payload) =>
          this.system.broadcast(this.peerSocketId, event, payload),
      };
    },
    join(room) {
      this.system.createRoom(room).joinRoom(room, this.peerSocketId);
      return {
        emit: (event, payload) =>
          this.system.emitToRoom(room, this.peerSocketId, event, payload),
      };
    },
  },
};

function send(payload) {
  const socket = this.system.getSocket(this.peerSocketId);
  socket.emit("message", payload);
}

function emit(event, payload) {
  const socket = this.system.getSocket(this.peerSocketId);
  socket.emit(event, payload);
}

function addEventListener(event, listener) {
  const socket = this.system.getSocket(this.socketId);
  socket.on(event, listener);
}
