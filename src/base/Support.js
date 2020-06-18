export default {
  hasWheel: 'onwheel' in window,
  hasKeyDown: 'onkeydown' in document,
  isTouch: 'ontouchstart' in window,
  isFirefox: navigator.userAgent.indexOf('Firefox') > -1,
  isWindows: navigator.platform.indexOf('Win') > -1,
};
