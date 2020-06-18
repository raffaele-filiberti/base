import createListener from '../base/ListenerFactory';
import support from '../base/Support';
import { addEvent } from '../utils/dom';

const emitter = createListener(true);

export const onResize = (fn) => emitter.on(fn);

const viewport = {};

const resize = () => {
  const { innerWidth: width, innerHeight: height } = window;
  viewport.width = width;
  viewport.height = height;
  viewport.ratio = width / height;

  emitter.emit(viewport);
};

const setVh = () => {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
};

resize();
setVh();

addEvent(window, 'resize', resize);
addEvent(window, support.isTouch ? 'orientationchange' : 'resize', setVh);

export default viewport;
