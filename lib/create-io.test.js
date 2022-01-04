import { createIo } from "./create-io.js";

test("create io client", async () => {
  const { io, report } = createIo();

  io();

  const summary = await report();

  expect(summary.clients.length).toBe(1);
  // expect(summary.attempts).toBe(1);
  expect(summary.numberOfClients).toBe(1);
});

test("Create non-interfering clients to allow for parallel testing", async () => {
  const { io: fooIo, report: firstReport } = createIo();
  const { io: barIo, report: secondReport } = createIo();

  fooIo();
  fooIo();

  barIo();
  barIo();
  barIo();

  const firstSummary = await firstReport();
  const secondSummary = await secondReport();

  expect(firstSummary.clients.length).toBe(2);
  // expect(firstSummary.attempts).toBe(2);
  expect(firstSummary.numberOfClients).toBe(2);

  expect(secondSummary.clients.length).toBe(3);
  // expect(secondSummary.attempts).toBe(3);
  expect(secondSummary.numberOfClients).toBe(3);
});

test("send a message event", async () => {
  const { io, report } = createIo();

  const socket = io();

  socket.send("A message from the client");

  const {
    clients: [client],
  } = await report();

  expect(client.dispatched).toEqual([
    { event: "message", message: "A message from the client" },
  ]);
});

test("receive a message event", async () => {
  const { io, report, onConnection } = createIo();

  onConnection((socketCounterpart) => {
    socketCounterpart.send("A message from the server");
  });

  const socket = io();

  socket.on("message", (data) => {
    expect(data).toEqual("A message from the server");
  });

  const {
    clients: [client],
  } = await report();

  expect(client.messages.received).toEqual([
    { event: "message", message: "A message from the server" },
  ]);
});

test("emit a custum event", async () => {
  const { io, report } = createIo();

  const socket = io();

  socket.emit("userEvent", "A custom event payload");

  const {
    // allClients: { dispatchedMessages },
    clients: [client],
  } = await report();

  // expect(dispatchedMessages).toEqual([
  //   { event: "userEvent", message: "A custom event payload" },
  // ]);

  expect(client.messages.dispatched).toEqual([
    { event: "userEvent", message: "A custom event payload" },
  ]);
});

test("receive a custum event", async () => {
  const { io, report, onConnection } = createIo();

  onConnection((socketCounterpart) => {
    socketCounterpart.emit("userEvent", "An userEvent from the server");
  });

  const socket = io();

  socket.on("userEvent", (data) => {
    expect(data).toEqual("An userEvent from the server");
  });

  const {
    // allClients: { receivedMessages },
    clients: [client],
  } = await report();

  // expect(receivedMessages).toEqual([
  //   { event: "userEvent", message: "An userEvent from the server" },
  // ]);
  expect(client.messages.received).toEqual([
    { event: "userEvent", message: "An userEvent from the server" },
  ]);
});

test("emit event to all clients", async () => {
  const { io, report, emit } = createIo();

  io().on("emitEvent", (payload) => {
    expect(payload).toEqual("To all connected clients");
  });
  io().on("emitEvent", (payload) => {
    expect(payload).toEqual("To all connected clients");
  });
  io().on("emitEvent", (payload) => {
    expect(payload).toEqual("To all connected clients");
  });

  emit("emitEvent", "To all connected clients");

  const {
    // allClients: { receivedMessages },
    clients: [firstClient, secondClient, thirdClient],
  } = await report();

  // expect(receivedMessages).toEqual([
  //   { event: "emitEvent", message: "To all connected clients" },
  //   { event: "emitEvent", message: "To all connected clients" },
  //   { event: "emitEvent", message: "To all connected clients" },
  // ]);
  expect(firstClient.messages.received).toEqual([
    { event: "emitEvent", message: "To all connected clients" },
  ]);
  expect(secondClient.messages.received).toEqual([
    { event: "emitEvent", message: "To all connected clients" },
  ]);
  expect(thirdClient.messages.received).toEqual([
    { event: "emitEvent", message: "To all connected clients" },
  ]);
});

test("broadcast event to all clients", async () => {
  const { io, report, onConnection } = createIo();

  let isFirstClient = true;

  onConnection((socketCounterpart) => {
    if (isFirstClient) {
      socketCounterpart.broadcast.emit(
        "broadcastEvent",
        "Broadcasting to most clients"
      );
      isFirstClient = false;
    }
  });

  const listener = jest.fn();

  io().on("broadcastEvent", listener);
  io().on("broadcastEvent", (payload) => {
    expect(payload).toEqual("Broadcasting to most clients");
  });
  io().on("broadcastEvent", (payload) => {
    expect(payload).toEqual("Broadcasting to most clients");
  });

  const {
    // allClients: { receivedMessages },
    clients: [firstClient, secondClient, thirdClient],
  } = await report();

  // expect(receivedMessages).toEqual([
  //   { event: "broadcastEvent", message: "Broadcasting to most clients" },
  //   { event: "broadcastEvent", message: "Broadcasting to most clients" },
  // ]);
  expect(firstClient.messages.received).toEqual([]);
  expect(listener).not.toHaveBeenCalled();

  expect(secondClient.messages.received).toEqual([
    { event: "broadcastEvent", message: "Broadcasting to most clients" },
  ]);
  expect(thirdClient.messages.received).toEqual([
    { event: "broadcastEvent", message: "Broadcasting to most clients" },
  ]);
});

test("socket join a room", async () => {
  const { io, report, onConnection } = createIo();

  let isSecondClient = false;

  onConnection((socketCounterpart) => {
    if (isSecondClient) {
      socketCounterpart
        .join("userRoom")
        .emit("roomMessages", "private messages");
      return;
    }

    socketCounterpart.join("userRoom");
    isSecondClient = true;
  });

  io().on("roomMessages", (payload) => {
    expect(payload).toEqual("private messages");
  });

  const listener = jest.fn();

  io().on("roomMessages", listener);

  const {
    // allClients: { receivedMessages },
    clients: [firstClient, secondClient],
  } = await report();

  // expect(receivedMessages).toEqual([
  //   { event: "roomMessages", message: "private messages" },
  // ]);

  expect(firstClient.messages.received).toEqual([
    { event: "roomMessages", message: "private messages" },
  ]);

  expect(secondClient.messages.received).toEqual([]);
  expect(listener).not.toHaveBeenCalled();
});
