export const camelCase = (string) => string.replace(/^([A-Z])|[\s-_]+(\w)/g, (match, p1, p2) => (p2 ? p2.toUpperCase() : p1.toLowerCase()));
export const paramCase = (string) => camelCase(string)
  .split(/(?=[A-Z])/g)
  .map((value) => value.charAt(0).toLowerCase() + value.substring(1))
  .join('-');

export const isVowel = (value) => 'aeiouAEIOU'.indexOf(value) !== -1;
