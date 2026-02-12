/**
 * 중앙화된 API 클라이언트
 * - 모든 요청에 보안 헤더 자동 추가
 * - 401 에러 시 자동 토큰 갱신
 * - 에러 처리 표준화
 */

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  }

  private async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { skipAuth = false, headers = {}, ...restOptions } = options;

    // 모든 요청에 보안 헤더 추가
    const defaultHeaders: HeadersInit = {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest", // CSRF 보호
      ...headers,
    };

    // Authorization 헤더 추가 (localStorage에서 토큰 가져오기)
    if (!skipAuth) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        defaultHeaders["Authorization"] = `Bearer ${token}`;
      }
    }

    const config: RequestInit = {
      ...restOptions,
      headers: defaultHeaders,
      credentials: "include", // 쿠키 포함
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);

      // 401 에러 시 토큰 갱신 시도 (단, /users/me 엔드포인트는 제외)
      // /users/me는 초기 로드 시 사용자 확인용이므로 401이 정상일 수 있음
      if (response.status === 401 && !skipAuth && !endpoint.includes("/users/me")) {
        // localStorage 토큰 제거 (만료됨)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }

        const refreshed = await this.refreshToken();

        if (refreshed) {
          // 재시도
          return this.request<T>(endpoint, { ...options, skipAuth: true });
        } else {
          // Refresh 실패 시 로그인 페이지로
          if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
          throw new Error("인증이 만료되었습니다.");
        }
      }

      // /users/me에서 401이면 조용히 에러 던지기 (로그인 안 한 상태)
      if (response.status === 401 && endpoint.includes("/users/me")) {
        throw new Error("로그인이 필요합니다.");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "요청에 실패했습니다.");
      }

      // 204 No Content 처리
      if (response.status === 204) {
        return null as T;
      }

      // Content-Type 확인
      const contentType = response.headers.get("content-type");

      // JSON 응답인 경우
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }

      // plain text 응답인 경우 (예: 로그아웃 성공 메시지)
      if (contentType && contentType.includes("text/plain")) {
        const text = await response.text();
        return text as T;
      }

      // 기타 경우 JSON으로 시도
      return await response.json();
    } catch (error) {
      // /users/me에서 발생하는 에러는 로그 출력 안 함 (정상적인 로그인 전 상태)
      if (process.env.NODE_ENV === "development" && !endpoint.includes("/users/me")) {
        console.error(`API 요청 실패: ${endpoint}`, error);
      }
      throw error;
    }
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      return response.ok;
    } catch (error) {
      console.error("토큰 갱신 실패:", error);
      return false;
    }
  }

  // 편의 메서드들
  async get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options?: FetchOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options?: FetchOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
