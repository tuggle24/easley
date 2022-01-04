export function emitter() {
  const messages = [];
  const events = {};
  return {
    emit(event, payload) {
      messages.push({ event, message: payload });
      const eventHandler = events[event];
      if (eventHandler === undefined) return;
      eventHandler(payload);
    },
    on(event, listener) {
      events[event] = listener;
    },
    messages,
  };
}
