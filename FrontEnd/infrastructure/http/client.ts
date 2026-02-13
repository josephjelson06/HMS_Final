// HTTP client — centralized fetch wrapper for future API calls.
// All API repositories will use this instead of raw fetch().

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

class HttpClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.defaultHeaders['Authorization'];
  }

  private buildUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(path, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    return url.toString();
  }

  private async request<T>(method: HttpMethod, path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const url = this.buildUrl(path, options?.params);
    const res = await fetch(url, {
      method,
      headers: { ...this.defaultHeaders, ...options?.headers },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || `HTTP ${res.status}: ${res.statusText}`);
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  }

  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, undefined, options);
  }

  async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, body, options);
  }

  async put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', path, body, options);
  }

  async patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PATCH', path, body, options);
  }

  async delete<T = void>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, undefined, options);
  }
}

// Singleton instance — all API repositories import this
const API_URL = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL
  : 'http://localhost:5000';

export const httpClient = new HttpClient(API_URL);
export default HttpClient;
