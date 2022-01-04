export function facade(system, channelId, c) {
  return {
    send(payload) {
      this.emit("message", payload);
    },
    emit(event, payload) {
      const channel = system.getAgent(channelId);
      channel.emit(event, payload);
    },
    on(event, listener) {
      const channel = system.getAgent(c);
      channel.on(event, listener);
    },
    broadcast: {
      emit(event, payload) {
        system.broadcast(channelId, event, payload);
      },
    },
    join(room) {
      system.createRoom(room);

      system.joinRoom(room, channelId);
      return {
        emit(event, payload) {
          system.emitToRoom(room, channelId, event, payload);
        },
      };
    },
  };
}
