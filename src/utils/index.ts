export const fetcher = (url: string, init?: RequestInit) => {
  return fetch(`/api${url}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });
};
