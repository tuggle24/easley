import { createSystem } from "./system.js";
import { createServer } from "./server.js";
import { createTaskStore } from "./task-store.js";
import { facade } from "./sockets.js";

export function createIo(options = {}) {
  const taskStore = createTaskStore();
  const system = createSystem();
  const server = createServer(system);

  return {
    server,
    async report() {
      const { emptyStore } = taskStore;
      await emptyStore();
      return await system.report();
    },
    onConnection(c) {
      server.on("connection", c);
    },
    emit(e, m) {
      system.emit(e, m);
    },
    io(url, options) {
      const clientSocketId = Symbol();
      const serverSocketId = Symbol();

      const cs = facade(system, serverSocketId, clientSocketId);
      const ss = facade(system, clientSocketId, serverSocketId, server);

      system.saveChannel({ clientSocketId, serverSocketId });

      taskStore.insertTask(() => server.emit("connection", ss));

      return cs;
    },
  };
}
