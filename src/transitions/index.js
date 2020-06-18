import barba from '@barba/core';
import createIndexView from '@/views/Index';
import createDefaultTransition from './default';

export default (scrollbar) => {
  barba.init({
    debug: true,
    preventRunning: true,
    views: [
      createIndexView(scrollbar),
    ],
    transitions: [
      createDefaultTransition(scrollbar),
    ],
  });

  barba.hooks.enter(() => {
    document.documentElement.classList.add('is-transitioning');
    scrollbar.destroy();
  });

  barba.hooks.after(({ next: { container, namespace } }) => {
    if (window.ga) {
      window.ga('set', 'page', window.location.pathname);
      window.ga('send', 'pageview');
    }
    document.documentElement.classList.remove('is-transitioning');
    if (namespace !== 'index') scrollbar.init(container);
  });
};
