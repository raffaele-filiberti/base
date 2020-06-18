import anime from 'animejs';

export default (scrollbar) => ({
  name: 'default',
  once: ({ next: { container, namespace } }) => {
    const loader = document.querySelector('.loader');
    if (namespace !== 'index') scrollbar.init(container);
    return anime
      .timeline()
      .add({
        targets: loader,
        translateX: '-100%',
        easing: 'easeOutExpo',
        delay: 1000,
        complete: () => loader.remove(),
      }).finished;
  },
  enter: ({ next: { container } }) => anime({
    targets: container,
    opacity: [0, 1],
    duration: 600,
    easing: 'easeOutExpo',
    delay: 50,
  }).finished,
  leave: ({ current: { container } }) => anime({
    targets: container,
    opacity: 0,
    duration: 600,
    easing: 'easeOutExpo',
    complete: () => {
      anime.set(container, { position: 'absolute' });
    },
  }).finished,
});
