import { createSocket } from "./create-socket.js";

test("create websocket client", async () => {
  const { WebSocket, report } = createSocket("WebSocket");

  WebSocket();

  const summary = await report();

  expect(summary.clients.length).toBe(1);
  expect(summary.numberOfClients).toBe(1);
});
