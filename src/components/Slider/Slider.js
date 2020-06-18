import { lerp } from '@/utils/math';
import { nextIndex, prevIndex, nearest } from '@/utils/array';
import { addEvent, transform } from '@/utils/dom';
import { createUnsubscribeCollection } from '@/utils/factory';
import createPointer from '@/events/Pointer';
import { onRaf } from '@/events/Raf';
import { onResize } from '@/events/Viewport';
import './Slider.css';

export default (el, opts = {}) => {
  const { identifier = 'slider', touchMultiplier = 1.5, speed = 0.1 } = opts;
  const dom = {
    el,
    track: el.querySelector(`[data-${identifier}-track]`),
    next: el.querySelector(`[data-${identifier}-next]`),
    prev: el.querySelector(`[data-${identifier}-prev]`),
    slides: Array.from(el.querySelectorAll(`[data-${identifier}-item]`)),
    bullets: Array.from(el.querySelectorAll(`[data-${identifier}-bullet]`)) || [],
    clones: [],
  };

  let current = 0;
  let target = 0;
  let start = 0;
  let index = 0;

  const { collection, unsubscribeCollection } = createUnsubscribeCollection();

  const { length } = dom.slides;

  let slidesCenter = [];

  const gesture = createPointer(dom.track);

  const getTarget = () => slidesCenter[index] * -1;

  const setIndex = (value) => {
    index = value < length && value >= 0 ? value : index;
  };

  const clampTarget = () => {
    target = Math.min(0, Math.max(-slidesCenter[slidesCenter.length - 1], target));
  };

  const go = (dir) => {
    switch (dir) {
      case 'next':
        nextIndex(index, length);
        break;
      case 'prev':
        prevIndex(index, length);
        break;
      default:
        setIndex(dir);
    }
    target = getTarget();
  };

  const onMove = ({ move, isDragging }) => {
    if (isDragging) {
      const movement = move.x * touchMultiplier;
      target += movement - start;
      clampTarget();
      start = movement;
    }
  };

  const onEnd = () => {
    if (start) {
      console.log(target * -1, slidesCenter);

      setIndex(nearest(target * -1, slidesCenter));
      target = getTarget();
      start = 0;
    }
  };

  const raf = () => {
    current = lerp(current, target, speed);
    transform(dom.track, current, 'x');
  };

  const resize = () => {
    slidesCenter = dom.slides.map(
      (slide, i) => (dom.track.scrollWidth / (length)) * i,
    );
  };

  collection.push(
    ...dom.bullets.map((bullet, i) => addEvent(bullet, 'click', go.bind(null, i))),
    addEvent(dom.next, 'click', go.bind(null, 'next')),
    addEvent(dom.prev, 'click', go.bind(null, 'prev')),
    gesture.destroy,
    gesture.onEnd(onEnd),
    gesture.onMove(onMove),
    onRaf(raf),
    onResize(resize),
  );

  return unsubscribeCollection;
};
