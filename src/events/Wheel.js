import createListener from '../base/ListenerFactory';
import { addEvent } from '../utils/dom';
import { createUnsubscribeCollection } from '../utils/factory';
import support from '../base/Support';

const keyCodes = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  SPACE: 32,
};

export default (opts = {}) => {
  if (!support.hasWheel && !support.hasKeyDown) return;

  const {
    useKeyboard = support.hasKeyDown,
    passive,
    mouseMultiplier = support.isWindows ? 1 : 0.4,
    firefoxMultiplier = 50,
    keyStep = 120,
  } = opts;

  const event = {
    x: 0,
    y: 0,
    deltaX: 0,
    deltaY: 0,
  };

  const emitter = createListener();

  const { collection, unsubscribeCollection } = createUnsubscribeCollection();

  const reset = () => {
    event.x = 0;
    event.y = 0;
  };

  const listenerOptions = passive ? { passive: true } : undefined;

  const notify = (e) => {
    event.x += event.deltaX;
    event.y += event.deltaY;

    emitter.emit({
      ...event,
      originalEvent: e,
    });
  };

  const onWheel = (e) => {
    event.deltaX = e.wheelDeltaX || e.deltaX * -1;
    event.deltaY = e.wheelDeltaY || e.deltaY * -1;

    if (support.isFirefox && e.deltaMode === 1) {
      event.deltaX *= firefoxMultiplier;
      event.deltaY *= firefoxMultiplier;
    }

    event.deltaX *= mouseMultiplier;
    event.deltaY *= mouseMultiplier;

    notify(e);
  };

  const onKeyDown = (e) => {
    event.deltaX = 0;
    event.deltaY = 0;
    const windowHeight = window.innerHeight - 40;

    switch (e.keyCode) {
      case keyCodes.LEFT:
      case keyCodes.UP:
        event.deltaY = keyStep;
        break;

      case keyCodes.RIGHT:
      case keyCodes.DOWN:
        event.deltaY = -keyStep;
        break;
      case keyCodes.SPACE && e.shiftKey:
        event.deltaY = windowHeight;
        break;
      case keyCodes.SPACE:
        event.deltaY = -windowHeight;
        break;
      default:
        return;
    }

    notify(e);
  };

  const unsubscribers = [
    addEvent(window, 'wheel', onWheel, listenerOptions),
    useKeyboard ? addEvent(document, 'keydown', onKeyDown) : undefined,
  ].filter(Boolean);

  collection.push(...unsubscribers);

  return {
    onWheel: (fn) => emitter.on(fn),
    destroy: unsubscribeCollection,
    reset,
  };
};
