export const apiBaseUrl = "/api/v1";

export const apiGet = async <T,>(path: string): Promise<T> => {
  const response = await fetch(`${apiBaseUrl}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return (await response.json()) as T;
};
