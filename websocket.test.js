import tap from "tap";
import { eventLoopCycle } from "./wait-for.js";
import { createWebSocket } from "./create-websocket.js";
import pWhilst from "p-whilst";

tap.test("Separate WebSocket factory", async (t) => {
  const { WebSocket: fooWebSocket, report: firstSummary } = createWebSocket();
  const { WebSocket: barWebSocket, report: secondSummary } = createWebSocket();

  new fooWebSocket();
  new fooWebSocket();

  new barWebSocket();
  new barWebSocket();
  new barWebSocket();

  let firstReport = await firstSummary();
  let secondReport = await secondSummary();

  t.equal(firstReport.clients.length, 2);
  t.equal(firstReport.attempts, 2);

  t.equal(secondReport.clients.length, 3);
  t.equal(secondReport.attempts, 3);
});

tap.test("Connect a socket", async (t) => {
  const { WebSocket, report } = createWebSocket();

  const socket = new WebSocket();

  t.equal(socket.readyState, 0);

  await eventLoopCycle();

  t.equal(socket.readyState, 1);

  let {
    clients: [client],
  } = await report();

  t.ok(client.isOpen, "Socket is connected after");
});

tap.skip("Property readyState is read only", async (t) => {
  const { WebSocket, report } = createWebSocket();

  const socket = new WebSocket();
  // socket.readyState = "NO";
  // t.throws(
  //   function () {
  //     socket.readyState = "NO";
  //   },
  //   { skip: true }
  // );
});

tap.test("Refuse a connection indefinetly", async (t) => {
  const { WebSocket, report } = createWebSocket({
    rejections: Number.POSITIVE_INFINITY,
  });

  let iterations = 0;

  await pWhilst(
    () => iterations < 10,
    async () => {
      iterations++;
      const tempSocket = new WebSocket();

      t.equal(tempSocket.readyState, 0);

      await eventLoopCycle();

      t.equal(tempSocket.readyState, 3);
    }
  );

  let { clients, attempts } = await report();

  t.equal(clients.length, 0);
  t.equal(attempts, 10);
});

tap.test("Refuse a connection 2 times", async (t) => {
  const { WebSocket, report } = createWebSocket({
    rejections: 2,
  });

  let iterations = 0;

  await pWhilst(
    () => iterations < 2,
    async () => {
      iterations++;
      const tempSocket = new WebSocket();

      t.equal(tempSocket.readyState, 0);

      await eventLoopCycle();

      t.equal(tempSocket.readyState, 3);
    }
  );

  const socket = new WebSocket();

  t.equal(socket.readyState, 0);

  await eventLoopCycle();

  t.equal(socket.readyState, 1);

  let { clients, attempts } = await report();

  t.equal(clients.length, 1);
  t.equal(attempts, 3);
});

tap.test("Send a message", async (t) => {
  const { WebSocket, report } = createWebSocket();

  const socket = new WebSocket();

  await eventLoopCycle();

  socket.send("A message from the client");

  const {
    messages,
    clients: [client],
  } = await report();

  t.same(messages, ["A message from the client"]);
  t.same(client.messages, ["A message from the client"]);
});

tap.test("receive a message", async (t) => {
  const { WebSocket, onConnection, report } = createWebSocket();

  onConnection((socket) => {
    socket.send("A message from the server");
  });

  const socket = new WebSocket();

  socket.onmessage = (event) => {
    t.equal(event, "A message from the server");
  };

  const {
    receivedMessages,
    clients: [client],
  } = await report();

  t.same(receivedMessages, ["A message from the server"]);
  t.same(client.receivedMessages, ["A message from the server"]);
});
