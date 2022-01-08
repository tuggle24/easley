import { mixin } from "./mixin";

export const createProxyForClient = ({ socketType, ...configuration }) =>
  mixin(getMethodsForSocketType(socketType).client, configuration);

export const createProxyForServer = ({ socketType, ...configuration }) =>
  mixin(getMethodsForSocketType(socketType).server, configuration);

export function getMethodsForSocketType(socketType) {
  switch (socketType) {
    case "io":
      return io;
    case "WebSocket":
      return webSockets;
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
          this.system.broadcast(this.peerEmitter, event, payload),
      };
    },
    join(room) {
      this.system.createRoom(room).joinRoom(room, this.peerEmitter);
      return {
        emit: (event, payload) =>
          this.system.emitToRoom(room, this.peerEmitter, event, payload),
      };
    },
  },
};

function send(payload) {
  this.peerEmitter.emit("message", payload);
}

function emit(event, payload) {
  this.peerEmitter.emit(event, payload);
}

function addEventListener(event, listener) {
  this.emitter.on(event, listener);
}
