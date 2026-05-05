const AUTH_TOKEN_KEY = 'authToken';

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  const data = contentType && contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const error = data && data.error ? data.error : response.statusText;
    throw new Error(error || 'API request failed');
  }

  return data;
};

export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
};

export const clearAuthToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

const BASE_URL = 'http://localhost:5168';

const request = async (path, options = {}) => {
  const headers = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {})
  };

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  return handleResponse(response);
};

export const apiGet = async (path) => request(path);

export const apiPost = async (path, body) => request(path, { method: 'POST', body });

export const apiPut = async (path, body) => request(path, { method: 'PUT', body });

export const apiDelete = async (path) => request(path, { method: 'DELETE' });
