import { createWebSocketChannel } from "./websocket-channel.js";

export function createSockJS(base) {
  return function SockJS() {
    const channel = createWebSocketChannel(base);
    base.increaseAttepmts();
    base.saveChannel(this, channel);

    Object.defineProperties(this, {
      readyState: {
        get: function () {
          return channel.readyState;
        },
      },
      onmessage: {
        set: function (listener) {
          channel.saveListener(listener);
        },
      },
      send: {
        value: function (msg) {
          setTimeout(() => {
            channel.saveMessage(msg);
          });
        },
      },
    });

    setTimeout(() => {
      if (base.isAcceptingConnections()) {
        channel.updateReadyState(1);
        base.connectChannel(channel);
      } else {
        channel.updateReadyState(3);
      }
    });
  };
}
