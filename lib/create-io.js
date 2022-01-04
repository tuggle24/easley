import { createSystem } from "./system.js";
import { createServer } from "./server.js";
import { createTaskStore } from "./task-store.js";
import {
  createIoClientSocketFacade,
  createIoServerSocketFacade,
} from "./socket-facades.js";

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

      const clientSocket = createIoClientSocketFacade(
        system,
        clientSocketId,
        serverSocketId
      );
      const serverSocket = createIoServerSocketFacade(
        system,
        serverSocketId,
        clientSocketId
      );

      system.saveChannel({ clientSocketId, serverSocketId });

      taskStore.insertTask(() => server.emit("connection", serverSocket));

      return clientSocket;
    },
  };
}
