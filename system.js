import waitFor from "./wait-for.js";

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
      const {
        clientSocketAgent,
        clientSocketId,
        serverSocketAgent,
        serverSocketId,
      } = channel;

      channels.set(clientSocketId, serverSocketId);

      agents.set(clientSocketId, vent());
      agents.set(serverSocketId, vent());
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

export function createServer(system) {
  const events = {};
  return {
    emit(event, channel) {
      const eventHandler = events[event];

      if (eventHandler === undefined) return;
      eventHandler(channel);
    },
    on(event, listener) {
      events[event] = listener;
    },
  };
}

export const createIo = (system, server, taskStore) => (url, options) => {
  const csId = Symbol();
  const ssId = Symbol();

  const cs = facade(system, ssId, csId);
  const ss = facade(system, csId, ssId, server);

  system.saveChannel({
    clientSocketAgent: cs,
    clientSocketId: csId,
    serverSocketAgent: ss,
    serverSocketId: ssId,
  });

  taskStore.insertTask(() => server.emit("connection", ss));
  return cs;
};

const facade = (system, channelId, c) => {
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
};

function vent() {
  const messages = [];
  const events = {};
  return {
    emit(event, payload) {
      messages.push({ event, message: payload });
      const eventHandler = events[event];
      if (eventHandler === undefined) return;
      eventHandler(payload);
    },
    on(event, listener) {
      events[event] = listener;
    },
    messages,
  };
}

export function createTaskStore() {
  const tasks = new Set();

  const emptyStore = async () => {
    return await waitFor(async () => tasks.size === 0);
  };

  const removeTask = (task) => tasks.delete(task);

  const insertTask = (action, time = 0) => {
    const task = setTimeout(() => {
      action();
      removeTask(task);
    }, time);

    tasks.add(task);
  };

  return {
    emptyStore,
    removeTask,
    insertTask,
  };
}
