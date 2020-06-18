function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response.json();
}
// eslint-disable-next-line import/prefer-default-export
export const axios = (
  { baseUrl = '', headers: baseHeaders = {} } = { baseUrl: '', baseHeaders: {} },
) => ({
  post: async (url, data, opts = {}) => {
    const { headers = {} } = opts;
    return fetch(baseUrl + url, {
      method: 'POST',
      headers: {
        ...baseHeaders,
        ...headers,
      },
      body: data instanceof FormData ? data : JSON.stringify(data),
    }).then(handleErrors);
  },
  get: async (url, opts = {}) => {
    const { headers = {} } = opts;
    const response = await window.fetch(baseUrl + url, {
      method: 'GET',
      headers: {
        ...baseHeaders,
        ...headers,
      },
    });
    return response.json();
  },
});
