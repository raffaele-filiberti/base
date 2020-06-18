import createListener from '../base/ListenerFactory';
import { addEvent } from '../utils/dom';
import { createUnsubscribeCollection } from '../utils/factory';
import { getAverage } from '../utils/array';
import support from '../base/Support';

export default (opts = {}) => {
  if (!support.hasWheel) return;

  const { passive } = opts;

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

  let prevTime = new Date().getTime();
  let scrollings = [];
  let canScroll = true;

  const setCanScroll = (value) => (canScroll = value);

  const onWheelHijacked = (e) => {
    const curTime = new Date().getTime();
    const value = e.wheelDelta || -e.deltaY || -e.detail;
    const delta = Math.max(-1, Math.min(1, value));

    const horizontalDetection = typeof e.deltaX !== 'undefined';
    const isScrollingVertically = Math.abs(e.deltaX) < Math.abs(e.deltaY) || !horizontalDetection;

    // Limiting the array to 150 (lets not waste memory!)
    if (scrollings.length > 149) {
      scrollings.shift();
    }

    // keeping record of the previous scrollings
    scrollings.push(Math.abs(value));

    // time difference between the last scroll and the current one
    const timeDiff = curTime - prevTime;
    prevTime = curTime;

    // haven't they scrolled in a while?
    // (enough to be consider a different scrolling action to scroll another section)
    if (timeDiff > 200) {
      // emptying the array, we dont care about old scrollings for our averages
      scrollings = [];
    }

    if (canScroll) {
      const averageEnd = getAverage(scrollings, 10);
      const averageMiddle = getAverage(scrollings, 70);
      const isAccelerating = averageEnd >= averageMiddle;

      // to avoid double swipes...
      if (isAccelerating && isScrollingVertically) {
        emitter.emit({
          direction: delta < 0 ? 'down' : 'up',
          originalEvent: e,
        });
      }
    }
  };

  const unsubscribers = [
    addEvent(window, 'wheel', onWheelHijacked, listenerOptions),
  ];

  collection.push(...unsubscribers);

  return {
    onHijack: (fn) => emitter.on(fn),
    destroy: unsubscribeCollection,
    setCanScroll,
    reset,
  };
};
