import { createUnsubscribeCollection } from '../utils/factory';
import createEmitter from '../base/Emitter';
import createPointer from './Pointer';

const eventsName = {
  up: 'SWIPE_UP',
  left: 'SWIPE_LEFT',
  down: 'SWIPE_DOWN',
  right: 'SWIPE_RIGHT',
};

export default (el = window, opts = {}) => {
  const {
    threshold = (type) => Math.max(
      25,
      Math.floor(
        0.15
            * (type === 'x'
              ? window.innerWidth || document.body.clientWidth
              : window.innerHeight || document.body.clientHeight),
      ),
    ),
    velocityThreshold = 10,
    disregardVelocityThreshold = (type, element) => Math.floor(
      0.5 * (type === 'x' ? element.clientWidth : element.clientHeight),
    ),
    // pressThreshold = 8,
    diagonalSwipes = false,
    diagonalLimit = Math.tan((45 * 1.5) / (180 * Math.PI)),
    // longPressTime = 500,
    // doubleTapTime = 300,
    // mouseSupport = true,
  } = opts;
  const pointerHandlers = createPointer(el);
  const emitter = createEmitter();

  const { collection, unsubscribeCollection } = createUnsubscribeCollection();

  let thresholdX;
  let disregardVelocityThresholdX;
  let thresholdY;
  // eslint-disable-next-line no-unused-vars
  let disregardVelocityThresholdY;
  let swipingHorizontal;
  let swipingVertical;
  // eslint-disable-next-line no-unused-vars
  let swipingDirection;

  const onStart = () => {
    thresholdX = threshold('x', el);
    thresholdY = threshold('y', el);
    disregardVelocityThresholdX = disregardVelocityThreshold('x', el);
    disregardVelocityThresholdY = disregardVelocityThreshold('y', el);
  };

  const onMove = ({ move }) => {
    const absTouchMoveX = Math.abs(move.x);
    const absTouchMoveY = Math.abs(move.y);
    swipingHorizontal = absTouchMoveX > thresholdX;
    swipingVertical = absTouchMoveY > thresholdY;
    // eslint-disable-next-line no-nested-ternary
    swipingDirection = absTouchMoveX > absTouchMoveY
      ? swipingHorizontal
        ? 'horizontal'
        : 'pre-horizontal'
      : swipingVertical
        ? 'vertical'
        : 'pre-vertical';
  };

  const onEnd = ({ end, start, velocity }) => {
    const x = end.x - start.x;
    const absX = Math.abs(x);
    const y = end.y - start.y;
    const absY = Math.abs(y);

    if (absX > thresholdX || absY > thresholdY) {
      const swipedHorizontal = diagonalSwipes
        ? Math.abs(x / y) <= diagonalLimit
        : absX >= absY && absX > thresholdX;
      const swipedVertical = diagonalSwipes
        ? Math.abs(y / x) <= diagonalLimit
        : absY > absX && absY > thresholdY;

      if (swipedHorizontal) {
        if (x < 0) {
          // Left swipe
          if (
            velocity.x < -velocityThreshold
            || x < -disregardVelocityThresholdX
          ) {
            emitter.emit(eventsName.left);
          }
        } else if (
          velocity.x > velocityThreshold
          || x > disregardVelocityThresholdX
        ) {
          emitter.emit(eventsName.right);
        }
      }
      if (swipedVertical) {
        if (y < 0) {
          // Upward swipe
          if (
            velocity.y < -velocityThreshold
            || y < -disregardVelocityThresholdY
          ) {
            emitter.emit(eventsName.up);
          }
        } else if (
          velocity.y > velocityThreshold
          || y > disregardVelocityThresholdY
        ) {
          emitter.emit(eventsName.down);
        }
      }
    }
  };

  collection.push(
    pointerHandlers.onStart(onStart),
    pointerHandlers.onMove(onMove),
    pointerHandlers.onEnd(onEnd),
    emitter.destroy,
  );

  return {
    onSwipeUp: (fn) => emitter.on(eventsName.up, fn),
    onSwipeDown: (fn) => emitter.on(eventsName.down, fn),
    onSwipeLeft: (fn) => emitter.on(eventsName.left, fn),
    onSwipeRight: (fn) => emitter.on(eventsName.right, fn),
    destory: unsubscribeCollection,
  };
};
