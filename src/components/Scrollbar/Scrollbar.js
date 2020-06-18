/* eslint-disable no-nested-ternary */
import { createElement, transform, addEvent } from '@/utils/dom';
import { lerp } from '@/utils/math';
import createWheel from '@/events/Wheel';
import createPointer from '@/events/Pointer';
import { onRaf } from '@/events/Raf';
import viewport, { onResize } from '@/events/Viewport';
import { createUnsubscribeCollection } from '@/utils/factory';
import './Scrollbar.css';

export default (opts = {}) => {
  const {
    identifier = 'scroll',
    callback = null,
    native = false,
    ease = 0.075,
    listener = document.body,
    useScrollbar = false,
  } = opts;

  let { direction = 'vertical', container = document } = opts;

  const scrollbar = useScrollbar && !native
    ? {
      manager: null,
      isClicked: false,
      el: createElement('div', { classes: `vs-scrollbar vs-${direction}` }),
      drag: {
        el: createElement('div', { classes: 'vs-scrolldrag' }),
        delta: 0,
        height: 50,
      },
    }
    : null;

  const wheelManager = createWheel();
  let cache = [];
  let section;
  let current = 0;
  let last = 0;
  let target = 0;
  let bounding = 0;
  let ticking = false;
  let isRunning = false;
  let isForcing = false;

  const addElements = () => {
    cache = [];
    const els = section.querySelectorAll(`[data-${identifier}-el]`);
    els.forEach((el) => {
      const isStatic = el.dataset[`${identifier}El`] === 'static';
      const speed = Number(el.dataset[`${identifier}Speed`]) || 0;
      const position = el.dataset[`${identifier}Position`];
      const call = el.dataset[`${identifier}Call`];
      const transformChild = el.dataset[`${identifier}Transform`]
        && el.querySelector(el.dataset[`${identifier}Transform`]);
      const repeat = el.dataset[`${identifier}Repeat`] && el.dataset[`${identifier}Repeat`] === 'true';
      const sticky = el.dataset[`${identifier}Sticky`] && el.dataset[`${identifier}Sticky`] === 'true';
      const targetEl = el.dataset[`${identifier}Target`] !== undefined
        ? container.querySelector(el.dataset[`${identifier}Target`])
        : el;

      // eslint-disable-next-line prefer-const
      let { bottom, top, left, right } = targetEl.getBoundingClientRect();
      if (direction !== 'vertical') {
        bottom = right;
        top = left;
      }
      // TODO: horizontal
      if (sticky) {
        const elDistance = el.getBoundingClientRect().top - top;
        top += viewport.height;
        bottom = top + targetEl.offsetHeight - viewport.height - el.offsetHeight - elDistance;
      }

      const middle = (bottom - top) / 2 + top;
      const instance = {
        el,
        visible: false,
        top,
        call,
        bottom,
        middle,
        speed,
        position,
        repeat,
        sticky,
        transformChild,
        isStatic,
      };

      cache.push(instance);
    });
  };

  const detectElements = () => {
    cache.forEach(({ el, top, bottom, visible, repeat, call }, index) => {
      const scrollTop = current;
      const scrollBottom = scrollTop + (direction === 'vertical' ? viewport.height : viewport.width);

      if (!visible && scrollBottom >= top && scrollTop < bottom) {
        cache[index].visible = true;
        el.classList.add('in-view');

        if (call) {
          // TODO: centralize emit
          // Emitter.emit(call, { y: current });

          if (!repeat) {
            cache[index].call = false;
          }
        }
        if (!repeat && !call && visible) {
          cache[index] = null;
        }
      }

      if (visible && (scrollBottom < top || scrollTop > bottom)) {
        cache[index].visible = false;
        if (repeat) {
          el.classList.remove('in-view');
        }
      }
    });

    cache = cache.filter(Boolean);

    ticking = false;
  };

  // eslint-disable-next-line no-unused-vars
  const transformElements = (force) => {
    if (native) return;
    const scrollTop = current;
    const offset = direction === 'vertical' ? viewport.height : viewport.width;
    const scrollBottom = scrollTop + offset;
    const scrollMiddle = scrollTop + offset / 2;

    cache.forEach(
      ({
        el,
        transformChild,
        top,
        bottom,
        visible,
        middle,
        speed,
        position,
        sticky,
        isStatic,
      }) => {
        if (isStatic) return;
        let distance = force ? 0 : false;
        if (visible) {
          switch (position) {
            case 'top':
              distance = scrollTop * speed;
              break;
            case 'element':
              distance = (scrollBottom - top) * speed;
              break;
            case 'bottom':
              distance = (bounding - scrollBottom + offset) * -speed;
              break;
            default:
              distance = (scrollMiddle - middle) * speed;
          }
        }
        if (sticky) {
          if (visible) {
            distance = current - top + offset;
          } else if (current < top - offset && current < top - offset / 2) {
            distance = 0;
          } else if (current > bottom && current > bottom + 100) {
            distance = bottom - top + offset;
          } else {
            distance = false;
          }
        }

        if (distance !== false) transform(transformChild || el, distance, direction);
      },
    );
  };

  const clampTarget = () => {
    target = Math.round(Math.max(0, Math.min(target, bounding)));
  };

  const debounce = () => {
    const win = listener === document.body;
    current = direction === 'vertical'
      ? win
        ? window.scrollY || window.pageYOffset
        : listener.scrollTop
      : win
        ? window.scrollX || window.pageXOffset
        : listener.scrollLeft;

    if (cache.length) {
      if (!ticking) {
        requestAnimationFrame(() => {
          detectElements();
        });
        ticking = true;
      }
    }
  };

  const resize = ({ width, height }) => {
    const prop = direction === 'vertical' ? 'height' : 'width';
    const bounds = section.getBoundingClientRect();
    bounding = direction === 'vertical'
      ? bounds.height - (native ? 0 : height)
      : bounds.width - (native ? 0 : width);

    if (!native) {
      if (useScrollbar) {
        scrollbar.drag.bounds = direction === 'vertical' ? height : width;
        scrollbar.drag.height = height * (height / (bounding + height));
        scrollbar.drag.el.style[prop] = `${scrollbar.drag.height}px`;
      }
      clampTarget();
    }

    addElements();
    detectElements();
    transformElements(true);
  };

  const raf = () => {
    if (!isRunning) return;
    current = lerp(current, target, isForcing ? 0.9 : ease);

    if (current < 0.1) current = 0;

    transform(section, -current, direction);

    if (scrollbar) {
      const { height, bounds } = scrollbar.drag;
      const value = Math.abs(current) / (bounding / (bounds - height)) + height;
      const clamp = Math.max(0, Math.min(value - height, value + height));
      transform(scrollbar.drag.el, clamp, direction);
    }

    if (callback && current !== last) {
      callback(current);
    }

    detectElements();
    transformElements();
    last = current;
  };

  const calc = ({ deltaY }) => {
    const delta = deltaY;
    target += delta * -1;
    clampTarget();
  };

  const addEvents = () => {
    const {
      collection: events,
      unsubscribeCollection: removeEvents,
    } = createUnsubscribeCollection();

    const node = listener === document.body ? window : listener;

    if (native) {
      events.push(addEvent(node, 'scroll', debounce));
    } else {
      events.push(wheelManager.onWheel(calc));
      events.push(onRaf(raf));
    }

    events.push(onResize(resize));

    return removeEvents;
  };

  const calcScrollbarMove = ({ clientY, clientX }) => {
    const client = direction === 'vertical' ? clientY : clientX;
    const bounds = direction === 'vertical' ? viewport.height : viewport.width;
    const delta = client * (bounding / bounds);
    listener.classList.add('is-dragging');
    target = delta;
    clampTarget();
  };

  const mouseStart = ({ originalEvent }) => {
    originalEvent.preventDefault();
    if (originalEvent.which === 1) {
      scrollbar.isClicked = true;
    }
  };

  const mouseEnd = () => {
    scrollbar.isClicked = false;
    listener.classList.remove('is-dragging');
  };

  const mouseMove = ({ originalEvent }) => {
    if (scrollbar.isClicked) calcScrollbarMove(originalEvent);
  };

  const addFakebar = () => {
    const {
      collection: barEvents,
      unsubscribeCollection: removeBarEvents,
    } = createUnsubscribeCollection();

    listener.appendChild(scrollbar.el);
    scrollbar.el.appendChild(scrollbar.drag.el);
    scrollbar.manager = createPointer(scrollbar.el);

    barEvents.push(scrollbar.manager.onStart(mouseStart));
    barEvents.push(scrollbar.manager.onMove(mouseMove));
    barEvents.push(scrollbar.manager.onEnd(mouseEnd));
    barEvents.push(addEvents(scrollbar.el, 'click', calcScrollbarMove));
    barEvents.push(() => scrollbar.el.remove());

    return removeBarEvents;
  };

  let removeFakebar;
  let removeEvents;

  const destroy = () => {
    const type = native ? 'native' : 'virtual';
    const axis = direction === 'vertical' ? 'y' : 'x';
    listener.classList.remove(`is-${type}-scroll`, `${axis}-scroll`);
    if (useScrollbar) removeFakebar();
    if (removeEvents) removeEvents();
    current = 0;
    target = 0;
    isRunning = false;
  };

  const init = (el, dir) => {
    if (el) container = el;
    if (dir) direction = dir;
    section = container.querySelector(`[data-${identifier}-section]`);
    const type = native ? 'native' : 'virtual';
    const axis = direction === 'vertical' ? 'y' : 'x';
    listener.classList.add(`is-${type}-scroll`, `${axis}-scroll`);
    removeFakebar = useScrollbar ? addFakebar() : null;
    removeEvents = addEvents();
    isRunning = true;
  };

  return {
    init,
    resize,
    destroy,
    setPause: (value) => (isRunning = !value),
    to: (offset, force = false) => {
      if (native) {
        const node = listener === document.body ? window : listener;
        if (direction === 'vertical') {
          node.scrollTo(0, offset);
        } else {
          node.scrollTo(offset, 0);
        }
      } else {
        target = offset;
        isForcing = force;
        clampTarget();
      }
    },
  };
};
