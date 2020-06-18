import createEmitter from '../base/Emitter';
import { addEvent } from '../utils/dom';
import { createUnsubscribeCollection } from '../utils/factory';
import support from '../base/Support';

const convertEvent = (e) => {
  const t = {
    x: 0,
    y: 0,
  };

  if (!e) {
    return t;
  }

  if (e.touches || e.changedTouches) {
    if (e.touches.length) {
      t.x = e.touches[0].pageX;
      t.y = e.touches[0].pageY;
    } else {
      t.x = e.changedTouches[0].pageX;
      t.y = e.changedTouches[0].pageY;
    }
  } else {
    t.x = e.pageX;
    t.y = e.pageY;
  }

  return t;
};

const eventsName = {
  start: 'POINTER_START',
  end: 'POINTER_END',
  move: 'POINTER_MOVE',
};

export default (el = window, useTouch = support.isTouch) => {
  const event = {
    x: 0,
    y: 0,
    isDragging: 0,
    direction: null,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
    move: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
  };
  const emitter = createEmitter();

  const { collection, unsubscribeCollection } = createUnsubscribeCollection();

  const onStart = (evt) => {
    const e = convertEvent(evt);
    event.x = e.x;
    event.y = e.y;
    event.start.x = e.x;
    event.start.y = e.y;
    event.move.x = 0;
    event.move.y = 0;
    event.end.x = e.x;
    event.end.y = e.y;
    event.isDragging = true;
    emitter.emit(eventsName.start, { ...event, originalEvent: evt });
  };

  const onMove = (evt) => {
    const e = convertEvent(evt);

    event.x = e.x;
    const moveX = e.x - event.start.x;
    if (moveX < event.move.x) {
      event.direction = 'next';
    } else if (moveX > event.move.x) {
      event.direction = 'prev';
    }
    event.velocity.x = moveX - event.move.x;
    event.move.x = moveX;

    event.y = e.y;
    const moveY = e.y - event.start.y;
    event.velocity.y = moveY - event.move.y;
    event.move.y = moveY;

    emitter.emit(eventsName.move, { ...event, originalEvent: evt });
  };

  const onEnd = (evt) => {
    const e = convertEvent(evt);
    event.isDragging = false;
    event.end.x = e.x;
    event.end.y = e.y;

    emitter.emit(eventsName.end, { ...event, originalEvent: evt });
  };

  const unsubscribers = [
    useTouch && addEvent(el, 'touchstart', onStart, { passive: false }),
    useTouch && addEvent(el, 'touchmove', onMove, { passive: false }),
    useTouch && addEvent(el, 'touchend', onEnd, { passive: false }),
    addEvent(el, 'mousedown', onStart),
    addEvent(document, 'mousemove', onMove),
    addEvent(document, 'mouseup', onEnd),
  ].filter(Boolean);

  collection.push(...unsubscribers);

  return {
    onStart: (fn) => emitter.on(eventsName.start, fn),
    onMove: (fn) => emitter.on(eventsName.move, fn),
    onEnd: (fn) => emitter.on(eventsName.end, fn),
    destroy: unsubscribeCollection,
  };
};
