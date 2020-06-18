export default () => ({
  namespace: 'index',
  beforeEnter: (data) => {
    console.log('beforeEnter:index', data);
  },
  beforeLeave: (data) => {
    console.log('beforeLeave:index', data);
  },
});
