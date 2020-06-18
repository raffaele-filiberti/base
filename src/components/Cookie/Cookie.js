import anime from 'animejs';
import getCookie, { setCookie } from 'get-cookie';
import { addEvent } from '@/utils/dom';

export default ($el, opts = {}) => {
  const { cookieKey = 'boiler-cookie-accepted' } = opts;
  const acceptBtn = $el.querySelector('button');
  const cookie = getCookie(cookieKey);

  const setVisibility = (value) => {
    anime({
      targets: $el,
      translateY: value ? [-50, 0] : -50,
      opacity: value ? [0, 1] : 0,
      easing: 'easeOutExpo',
      complete: () => (value ? false : $el.remove()),
    });
  };

  if (!cookie) {
    setVisibility(true);
    addEvent(acceptBtn, 'click', (e) => {
      e.stopPropagation();
      const expireDate = new Date();
      expireDate.setDate(30 * 1000);
      setCookie(cookieKey, 'accepted', 365);
      setVisibility(false);
    });
  } else {
    $el.remove();
  }
};
