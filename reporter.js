import { eventLoopCycle } from "./wait-for.js";

export function createReporter(rehearsal) {
  const history = Object.assign(
    {
      messages: [],
      connectionCb: undefined,
      receivedMessages: [],
      rejections: 0,
      attempts: 0,
      channels: new Map(),
    },
    rehearsal
  );

  const reporter = {
    saveReceivedMessage(msg) {
      history.receivedMessages.push(msg);
    },
    saveMessage(msg) {
      history.messages.push(msg);
    },
    connectChannel(channel) {
      if (history.connectionCb) history.connectionCb(channel);
    },
    increaseAttepmts() {
      history.attempts++;
    },
    isAcceptingConnections() {
      return history.attempts - history.rejections > 0;
    },
    saveChannel(id, channel) {
      history.channels.set(id, channel);
    },
  };

  const report = async () => {
    await eventLoopCycle();
    const record = [];
    history.channels.forEach((value) => {
      if (value.isOpen) record.push(value);
    });
    return {
      clients: record,
      attempts: history.attempts,
      messages: history.messages,
      receivedMessages: history.receivedMessages,
    };
  };
  const onClose = () => {};
  const onConnection = (cb) => {
    history.connectionCb = cb;
  };

  return {
    reporter,
    report,
    onConnection,
    onClose,
  };
}
