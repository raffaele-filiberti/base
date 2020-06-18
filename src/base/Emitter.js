export default () => {
  const listeners = {};

  const fireAtStart = {};

  const off = (eventName, fn) => {
    listeners[eventName] = typeof fn === 'function'
      ? listeners[eventName].filter((i) => i !== fn)
      : [];
  };

  const on = (eventName, fn, order) => {
    listeners[eventName] = listeners[eventName] || [];
    if (typeof order === 'number') {
      listeners[eventName][order] = fn;
    } else {
      listeners[eventName].push(fn);
    }
    if (fireAtStart[eventName]) {
      fn(fireAtStart[eventName]);
    }
    return () => off(eventName, fn);
  };

  const once = (eventName, fn) => {
    listeners[eventName] = listeners[eventName] || [];
    const onceWrapper = () => {
      fn();
      off(eventName, onceWrapper);
    };
    listeners[eventName].push(onceWrapper);
  };

  const emit = (eventName, args, isFireAtStart = false) => {
    const fns = listeners[eventName];
    if (isFireAtStart) {
      fireAtStart[eventName] = args;
    }
    if (!fns) return false;
    fns.forEach((f) => {
      f(args);
    });
    return true;
  };

  const count = (eventName) => (listeners[eventName] || []).length;

  const raw = (eventName) => listeners[eventName];

  const destroy = () => {
    Object.assign(listeners, {});
    Object.assign(fireAtStart, {});
  };

  return {
    on,
    once,
    emit,
    count,
    raw,
    destroy,
  };
};
