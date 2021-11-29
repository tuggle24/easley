import { setupWebSocket } from "./setup-websocket.js";
import { createReporter } from "./reporter.js";

export function createWebSocket(rehearsal = {}) {
  const { reporter, report, onConnection } = createReporter(rehearsal);
  const WebSocket = setupWebSocket(reporter);

  return {
    WebSocket,
    report,
    onConnection,
  };
}
