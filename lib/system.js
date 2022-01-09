import { createEmitter } from "./event-emitter";

export function createSystem() {
  const channels = new Map();
  const rooms = new Map();

  return {
    createChannel() {
      const clientEmitter = createEmitter();
      const serverEmitter = createEmitter();
      channels.set(clientEmitter, serverEmitter);

      return { clientEmitter, serverEmitter };
    },
    async report() {
      const clients = [...channels.entries()].map(
        ([clientEmitter, serverEmitter]) => {
          return {
            dispatched: serverEmitter.messages,
            received: clientEmitter.messages,
            messages: {
              dispatched: serverEmitter.messages,
              received: clientEmitter.messages,
            },
          };
        }
      );
      return {
        clients: clients,
        numberOfClients: clients.length,
      };
    },
    emit(e, m) {
      channels.forEach((_, clientEmitter) => {
        clientEmitter.emit(e, m);
      });
    },
    broadcast(id, event, payload) {
      channels.forEach((_, clientEmitter) => {
        if (id === clientEmitter) return;
        clientEmitter.emit(event, payload);
      });
    },
    createRoom(room) {
      if (!rooms.has(room)) rooms.set(room, []);

      return this;
    },
    joinRoom(roomId, socketId) {
      const room = rooms.get(roomId);

      if (!room.includes(socketId)) {
        room.push(socketId);
      }
    },
    emitToRoom(room, channelId, event, payload) {
      rooms.get(room).forEach((emitter) => {
        if (emitter === channelId) return;
        emitter.emit(event, payload);
      });
    },
  };
}
