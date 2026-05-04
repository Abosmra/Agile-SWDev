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

export const apiGet = async (path) => {
  const response = await fetch(path, {
    headers: {
      'Accept': 'application/json'
    }
  });
  return handleResponse(response);
};

export const apiPost = async (path, body) => {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(body)
  });
  return handleResponse(response);
};
