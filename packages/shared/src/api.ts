import type { ApiStatus, Session } from "./types";

export type ApiClientOptions = {
  baseUrl: string;
  getToken?: () => string | null;
  fetcher?: typeof fetch;
};

export const createApiClient = ({ baseUrl, getToken, fetcher = fetch }: ApiClientOptions) => {
  const request = async <T>(path: string, init: RequestInit = {}) => {
    const token = getToken?.();
    const headers = new Headers(init.headers);

    headers.set("Content-Type", "application/json");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetcher(`${baseUrl}${path}`, {
      ...init,
      credentials: "include",
      headers,
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  };

  return {
    getStatus: () => request<ApiStatus>("/status"),
    getProfile: () => request<Session>("/profile"),
    login: (email: string) =>
      request<Session>("/login", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
    logout: () =>
      request<{ success: true }>("/logout", {
        method: "POST",
      }),
  };
};
