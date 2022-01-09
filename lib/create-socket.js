import { createSystem } from "./system.js";
import { createServer } from "./event-emitter.js";
import { createTaskStore } from "./task-store.js";
import {
  createProxyForServer,
  createProxyForClient,
} from "./socket-facades.js";

export function createSocket(socketType) {
  const taskStore = createTaskStore();
  const system = createSystem();
  const server = createServer();

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
      const { clientEmitter, serverEmitter } = system.createChannel();

      taskStore.insertTask(() =>
        server.emit(
          "connection",
          createProxyForServer({
            socketType,
            system,
            emitter: serverEmitter,
            peerEmitter: clientEmitter,
          })
        )
      );

      return createProxyForClient({
        socketType,
        system,
        emitter: clientEmitter,
        peerEmitter: serverEmitter,
      });
    },
  };
}
