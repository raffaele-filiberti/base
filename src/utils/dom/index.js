import { isObject, isString, isFunction, isArray } from '../type';
import { paramCase } from '../string';
import { createUnsubscribeCollection } from '../factory';

export function getTransform(value, direction = 'vertical') {
  switch (direction) {
    case 'y':
    case 'vertical':
      return `translate3d(0,${value}px,0)`;
    case 'x':
    case 'horizontal':
      return `translate3d(${value}px,0, 0)`;
    default:
      return `translate3d(${value.x}px,${value.y}px,0)`;
  }
}

export function transform(el, transformValue, direction = 'vertical') {
  Object.assign(el.style, {
    webkitTransform: getTransform(transformValue, direction),
    msTransform: getTransform(transformValue, direction),
    transform: getTransform(transformValue, direction),
  });
}

export function getTranslate(el) {
  const translate = {};
  if (!window.getComputedStyle) return;

  const style = getComputedStyle(el);
  // eslint-disable-next-line no-shadow
  const transform = style.transform || style.webkitTransform || style.mozTransform;

  let mat = transform.match(/^matrix3d\((.+)\)$/);
  if (mat) return parseFloat(mat[1].split(', ')[13]);

  mat = transform.match(/^matrix\((.+)\)$/);
  translate.x = mat ? parseFloat(mat[1].split(', ')[4]) : 0;
  translate.y = mat ? parseFloat(mat[1].split(', ')[5]) : 0;

  return translate;
}

export const addAttributes = (el, attributes, prefix = '') => {
  if (isObject(attributes)) {
    Object.keys(attributes).forEach((key) => {
      if (attributes[key] !== false) {
        el.setAttribute(prefix + paramCase(key), attributes[key]);
      }
    });
  }
};

export const addEvent = (el, event, fn, params) => {
  const add = (name) => {
    el.addEventListener(name, fn, params);
    return () => el.removeEventListener(name, fn);
  };

  if (event instanceof Array) {
    const { collection, unsubscribeCollection } = createUnsubscribeCollection();
    event.forEach((name) => collection.push(add(name)));
    return unsubscribeCollection;
  }

  return add(event);
};

export const createElement = (tag, opts = {}) => {
  const {
    classes,
    styles = {},
    dataset,
    children = [],
    onLoad,
    onError,
    ...attributes
  } = opts;

  if (isString(tag)) {
    const el = document.createElement(tag);

    if (tag === 'img') {
      if (isFunction(onLoad)) {
        el.onload = onLoad;
      }
      if (isFunction(onError)) {
        el.onerror = onError;
      }
    }
    if (isString(children)) {
      el.textContent = children;
    } else if (isArray(children)) {
      children.forEach((child) => el.insertAdjacentElement('beforeend', child));
    } else if (children instanceof HTMLElement) {
      el.insertAdjacentElement('beforeend', children);
    }

    if (isObject(styles)) {
      Object.assign(el.style, styles);
    }

    if (isString(classes)) {
      el.classList.add(...classes.split(' '));
    } else if (isArray(classes)) {
      el.classList.add(...classes);
    }

    const addAttributesToElement = addAttributes.bind(null, el);
    addAttributesToElement(attributes);
    addAttributesToElement(dataset, 'data-');
    return el;
  }

  return false;
};
