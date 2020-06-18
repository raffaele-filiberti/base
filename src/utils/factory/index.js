/* eslint-disable import/prefer-default-export */
export const createUnsubscribeCollection = () => {
  const collection = [];
  const unsubscribeCollection = () => collection.forEach((fn) => fn());

  return {
    collection,
    unsubscribeCollection,
  };
};
