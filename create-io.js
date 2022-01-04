import {
  createSystem,
  createServer,
  createIo as ci,
  createTaskStore,
} from "./system.js";

export function createIo(options = {}) {
  const taskStore = createTaskStore();
  const system = createSystem();
  const server = createServer(system);
  const io = ci(system, server, taskStore);

  return {
    io,
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
  };
}
