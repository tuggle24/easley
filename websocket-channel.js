export function createWebSocketChannel(base) {
  return {
    readyState: 0,
    messages: [],
    isOpen: false,
    updateReadyState(readyState) {
      this.readyState = readyState;
      this.isOpen = readyState === 1;
    },
    saveMessage(msg) {
      base.saveMessage(msg);
      this.messages.push(msg);
    },
    receivedMessages: [],
    events: new Map(),
    saveListener(listener) {
      this.events.set("message", listener);
    },
    send(msg) {
      base.saveReceivedMessage(msg);
      this.receivedMessages.push(msg);
      this.events.get("message")(msg);
    },
  };
}
