import { createSystem } from "./system.js";
import { createServer } from "./server.js";
import { createTaskStore } from "./task-store.js";
import {
  createProxyForServer,
  createProxyForClient,
} from "./socket-facades.js";

export function createSocket(socketType) {
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
    [socketType](url, options) {
      const clientSocketId = Symbol();
      const serverSocketId = Symbol();
      system.saveChannel({ clientSocketId, serverSocketId });

      taskStore.insertTask(() =>
        server.emit(
          "connection",
          createProxyForServer({
            socketType,
            system,
            socketId: serverSocketId,
            peerSocketId: clientSocketId,
          })
        )
      );

      return createProxyForClient({
        socketType,
        system,
        socketId: clientSocketId,
        peerSocketId: serverSocketId,
      });
    },
  };
}
