
import EventEmitter from '../../utils/event-emitter';

function setup(ctx, emitter) {
  // Object.defineProperty(ctx, 'emitter', )
  Object.keys(ctx.on || {}).forEach((event) => {
    ctx.eventListeners = ctx.eventListeners || [];
    const listener = ctx.on[event].bind(ctx);
    ctx.eventListeners.push({ event, listener });
    emitter.on(event, listener);
  });
  ctx.emit = (name, ...event) => emitter.emit(name, ...event);
}

function tearDownEmitter(ctx, emitter) {
  if (ctx.eventListeners) {
    ctx.eventListeners.forEach(({ event, listener }) => {
      emitter.removeListener(event, listener);
    });
    ctx.eventListeners.length = 0;
  }
  ctx.emit = () => {};
}

export default function bindEvents({ userInstance, componentInstance }) {
  const emitter = EventEmitter.mixin({});

  const unbindEvents = () => {
    tearDownEmitter(userInstance, emitter);
    tearDownEmitter(componentInstance, emitter);
  };

  setup(userInstance, emitter);
  setup(componentInstance, emitter);

  return unbindEvents;
}
