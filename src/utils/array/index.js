/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
export const prevIndex = (index, length, limit = false) => (index > 0 ? index - 1 : limit ? 0 : length - 1);

export const nextIndex = (index, length, limit = false) => (index < length - 1 ? index + 1 : limit ? length - 1 : 0);

export const directionByIndex = (prev, current, length) => {
  if (typeof prev !== 'number' || prev === -1) return null;
  return (prev === 0 && current === length - 1)
    || (prev > current && prev - current < length - 1)
    ? 'prev'
    : 'next';
};

export const nearest = (n, arr) => {
  const sortedArr = [...arr].sort((a, b) => a - b);
  if (n <= sortedArr[0]) return 0;
  if (n >= sortedArr[arr.length - 1]) return arr.length - 1;

  for (let i = 1; i < sortedArr.length; i++) {
    const prev = sortedArr[i - 1];
    const current = sortedArr[i];
    if (current === n) return current;
    if (current > n && prev < n) {
      return current - n < n - prev ? i : i - 1;
    }
  }
  return false;
};

export const getAverage = (elements, number) => {
  let sum = 0;

  // taking `number` elements from the end to make the average, if there are not enought, 1
  const lastElements = elements.slice(Math.max(elements.length - number, 1));

  for (let i = 0; i < lastElements.length; i++) {
    sum += lastElements[i];
  }

  return Math.ceil(sum / number);
};
