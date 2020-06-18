module.exports = (a, condition, b) => {
  console.log(typeof a === 'boolean' && String(a) === condition);

  return (typeof a === 'boolean' && String(a) === condition ? b : '');
};
