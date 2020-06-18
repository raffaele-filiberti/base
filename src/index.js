import './styles/index.css';
import createBarba from '@/transitions';
import createScrollbar from '@/components/Scrollbar';
import createCookie from '@/components/Cookie';

const domIsReady = () => new Promise((resolve) => {
  document.addEventListener('DOMContentLoaded', resolve);
});

const init = () => {
  document.documentElement.classList.add('ready');
  const scrollbar = createScrollbar({
    native: 'ontouchstart' in window,
    useScrollbar: true,
  });
  const $cookie = document.querySelector('#cookie');
  createBarba(scrollbar);
  createCookie($cookie);
};

domIsReady().then(init);
