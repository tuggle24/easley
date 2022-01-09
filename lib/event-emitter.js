import { mixin } from "./mixin";

function emit(event, payload) {
  if (this.events[event] !== undefined) this.events[event](payload);
}

function on(event, listener) {
  this.events[event] = listener;
}

export function createServer() {
  return mixin({ events: {}, emit, on });
}

export function createEmitter() {
  return mixin({
    events: {},
    messages: [],
    on,
    emit(event, payload) {
      this.messages.push({ event, message: payload });
      emit.call(this, event, payload);
    },
  });
}
