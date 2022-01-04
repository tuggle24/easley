function send(payload) {
  const channel = this.system.getSocket(this.peerSocketId);
  channel.emit("message", payload);
}

function emit(event, payload) {
  const channel = this.system.getSocket(this.peerSocketId);
  channel.emit(event, payload);
}

function on(event, listener) {
  const channel = this.system.getSocket(this.socketId);
  channel.on(event, listener);
}

export function createIoClientSocketFacade(system, socketId, peerSocketId) {
  return {
    system,
    socketId,
    peerSocketId,
    send,
    emit,
    on,
  };
}

export function createIoServerSocketFacade(system, socketId, peerSocketId) {
  return {
    system,
    socketId,
    peerSocketId,
    send,
    emit,
    on,
    broadcast: {
      emit: (event, payload) => system.broadcast(peerSocketId, event, payload),
    },
    join(room) {
      system.createRoom(room);
      system.joinRoom(room, peerSocketId);
      return {
        emit: (event, payload) =>
          system.emitToRoom(room, peerSocketId, event, payload),
      };
    },
  };
}
