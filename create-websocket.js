import { setupWebSocket } from "./setup-websocket.js";
import { eventLoopCycle } from "./wait-for.js";

export function createWebSocket(rehearsal = {}) {
  const base = {
    messages: [],
    connectionCb: undefined,
    receivedMessages: [],
    saveReceivedMessage(msg) {
      this.receivedMessages.push(msg);
    },
    saveMessage(msg) {
      this.messages.push(msg);
    },
    connectChannel(channel) {
      if (this.connectionCb) this.connectionCb(channel);
    },
    increaseAttepmts() {
      history.attempts++;
    },
    isAcceptingConnections() {
      return history.attempts - script.rejections > 0;
    },
    channels: new Map(),
    saveChannel(id, channel) {
      this.channels.set(id, channel);
    },
  };

  const onConnection = (cb) => {
    base.connectionCb = cb;
  };

  const script = Object.assign(
    {
      rejections: 0,
    },
    rehearsal
  );

  let history = { attempts: 0 };

  const report = async () => {
    await eventLoopCycle();
    const record = [];
    base.channels.forEach((value) => {
      if (value.isOpen) record.push(value);
    });
    return {
      clients: record,
      attempts: history.attempts,
      messages: base.messages,
      receivedMessages: base.receivedMessages,
    };
  };

  const WebSocket = setupWebSocket(base);

  return {
    WebSocket,
    onConnection,
    report,
  };
}
