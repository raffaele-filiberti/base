export const lerp = (v0, v1, t) => v0 * (1 - t) + v1 * t;

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const modulate = (value, [inMin, inMax], [outMin, outMax], limit) => {
  const map = ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  if (limit) {
    return clamp(
      map,
      outMin < outMax ? outMin : outMax,
      outMax > outMin ? outMax : outMin,
    );
  }
  return map;
};
