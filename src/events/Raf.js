import createListener from '../base/ListenerFactory';

const emitter = createListener();

export const onRaf = (fn) => emitter.on(fn);

let startTime = 0;
let oldTime = 0;
let delta = 0;
let isPaused = true;

const onTick = (now) => {
  if (!isPaused) {
    delta = (now - oldTime) / 1000;
    oldTime = now;

    emitter.emit({
      delta,
      now,
    });
  }

  window.requestAnimationFrame(onTick);
};

export const start = () => {
  startTime = window.performance.now();
  oldTime = startTime;
  isPaused = false;

  onTick(startTime);
};

export const setPause = (value) => {
  isPaused = value;
  return value;
};

start();
