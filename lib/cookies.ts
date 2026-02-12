/**
 * 클라이언트에서 쿠키 존재 여부 확인
 */
export function hasAuthCookies(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const cookies = document.cookie

  // 백엔드에서 설정하는 인증 쿠키 이름들 (백엔드 설정에 맞게 수정 필요)
  const authCookieNames = [
    'accessToken',
    'refreshToken',
    'JSESSIONID', // Spring Security 기본 세션 쿠키
    'SESSION',
  ]

  const hasAuth = authCookieNames.some(cookieName =>
    cookies.includes(`${cookieName}=`)
  )

  // 디버깅용 로그 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development') {
    console.log('[Auth] 현재 쿠키:', cookies)
    console.log('[Auth] 인증 쿠키 존재 여부:', hasAuth)
  }

  return hasAuth
}

/**
 * 특정 쿠키 값 가져오기
 */
export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)

  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null
  }

  return null
}
