export const isObject = (value) => value && Object.prototype.toString.call(value) === '[object Object]';

export const isString = (value) => value && typeof value === 'string';

export const isArray = (value) => value && value && Object.prototype.toString.call(value) === '[object Array]';

export const isFunction = (value) => value && typeof value === 'function';

export const isMandatory = (value) => {
  throw Error(`${value} is required`);
};

export const isNumber = (value) => typeof value === 'number';

export const isColor = (value) => isArray(value) && value.r && value.g && value.b;

export const isMat3 = (value) => isArray(value) && value.length === 9;

export const isMat4 = (value) => isArray(value) && value.length === 16;

const has4DCoord = ({ x, y, z, w }) => isNumber(x) && isNumber(y) && isNumber(z) && isNumber(w);
const has3DCoord = ({ x, y, z, w }) => isNumber(x) && isNumber(y) && isNumber(z) && !isNumber(w);
const has2DCoord = ({ x, y, z, w }) => isNumber(x) && isNumber(y) && !isNumber(z) && !isNumber(w);

export const isVector4 = (value) => (isArray(value) && has4DCoord(value))
  || (isObject(value) && has4DCoord(value));

export const isVector3 = (value) => (isArray(value) && has3DCoord(value))
  || (isObject(value) && has3DCoord(value));

export const isVector2 = (value) => (isArray(value) && has2DCoord(value))
  || (isObject(value) && has2DCoord(value));
