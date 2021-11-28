export const reporter = () => {
  return {
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
};
