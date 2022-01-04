import { emitter } from "./event-emitter";
// server send method called ~ client dispatch message
// client facade send method called ~ client received message

// server facade send method called ~ client agent send method called ~ client received message
// client facade send method called ~ server agent send method called ~ client dispatch message

export function createSystem() {
  const channels = new Map();
  const agents = new Map();
  const rooms = new Map();

  return {
    saveChannel(channel) {
      const { clientSocketId, serverSocketId } = channel;

      channels.set(clientSocketId, serverSocketId);

      agents.set(clientSocketId, emitter());
      agents.set(serverSocketId, emitter());
    },
    getAgent(id) {
      return agents.get(id);
    },
    getAgentCounterpart(id) {
      channels.forEach([c, s]);
    },
    async report() {
      const clients = [...channels.entries()].map(
        ([clientSocketId, serverSocketId]) => {
          return {
            dispatched: agents.get(serverSocketId).messages,
            received: agents.get(clientSocketId).messages,
            messages: {
              dispatched: agents.get(serverSocketId).messages,
              received: agents.get(clientSocketId).messages,
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
      channels.forEach((_, clientSocketId) => {
        const clientSocket = agents.get(clientSocketId);
        clientSocket.emit(e, m);
      });
    },
    broadcast(id, event, payload) {
      channels.forEach((_, clientSocketId) => {
        if (id === clientSocketId) return;
        const clientSocket = agents.get(clientSocketId);
        clientSocket.emit(event, payload);
      });
    },
    createRoom(room) {
      if (rooms.has(room)) return rooms.get(room);

      rooms.set(room, []);
      return rooms.get(room);
    },
    joinRoom(room, id) {
      rooms.get(room).push(id);
    },
    emitToRoom(room, channelId, event, payload) {
      rooms.get(room).forEach((id) => {
        if (id === channelId) return;
        const agent = agents.get(id);
        agent.emit(event, payload);
      });
    },
  };
}
