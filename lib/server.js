export function createServer(system) {
  const events = {};
  return {
    emit(event, channel) {
      const eventHandler = events[event];

      if (eventHandler === undefined) return;
      eventHandler(channel);
    },
    on(event, listener) {
      events[event] = listener;
    },
  };
}
