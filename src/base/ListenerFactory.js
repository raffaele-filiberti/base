export default (fireAtStart = false) => {
  let fns = [];
  let fireAtStartParams;

  const count = () => (fns || []).length;

  const on = (fn, order) => {
    if (typeof order === 'number') {
      fns[order] = fn;
    } else {
      fns.push(fn);
    }
    if (fireAtStart) fn(fireAtStartParams);

    return () => (fns = fns.filter((i) => i !== fn));
  };

  const emit = (params) => {
    if (fireAtStart) {
      fireAtStartParams = params;
    }
    fns.forEach((fn) => fn(params));
  };

  return {
    emit,
    on,
    count,
  };
};
