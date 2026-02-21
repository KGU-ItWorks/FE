"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"

type Role = "ROLE_USER" | "ROLE_ADMIN" | "ROLE_UPLOADER"

interface User {
  id: number
  email: string
  nickname: string
  role: Role
  provider?: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // 사용자 정보 가져오기
  const fetchUser = useCallback(async () => {
    if (typeof window === 'undefined') {
      return null
    }

    try {
      const userData = await apiClient.get<User>("/api/v1/users/me")
      setUser(userData)
      return userData
    } catch (error) {
      // 로그인 전 상태는 정상이므로 에러를 조용히 처리
      // 개발 환경에서도 로그 출력 안 함
      setUser(null)
      return null
    }
  }, [])

  // 자동 토큰 갱신 설정
  const setupTokenRefresh = useCallback(() => {
    // 기존 interval 제거
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
    }

    // 25분마다 토큰 갱신 (Access Token이 30분이므로 여유 있게)
    refreshIntervalRef.current = setInterval(async () => {
      try {
        await fetch("http://localhost:8080/api/v1/auth/refresh", {
          method: "POST",
          credentials: "include",
          headers: {
            "X-Requested-With": "XMLHttpRequest",
          },
        })
        console.log("[Auth] 토큰 자동 갱신 성공")
      } catch (error) {
        console.error("[Auth] 자동 토큰 갱신 실패:", error)
        // 갱신 실패 시 로그아웃
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current)
        }
        setUser(null)
        router.push("/login")
      }
    }, 25 * 60 * 1000) // 25분

    console.log("[Auth] 자동 토큰 갱신 활성화 (25분마다)")
  }, [router])

  // 초기 로드 시 사용자 정보 확인
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true)
      const userData = await fetchUser()

      // 로그인된 경우 자동 갱신 시작
      if (userData) {
        setupTokenRefresh()
      }

      setIsLoading(false)
    }

    initAuth()

    // Cleanup
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [fetchUser, setupTokenRefresh])

  // 다중 탭 동기화
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth_logout") {
        // 다른 탭에서 로그아웃 발생
        console.log("[Auth] 다른 탭에서 로그아웃 감지")
        setUser(null)
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current)
        }
        router.push("/login")
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [router])

  // 로그인
  const login = async (email: string, password: string) => {
    try {
      const userData = await apiClient.post<User>("/api/v1/auth/login", {
        email,
        password,
      })

      setUser(userData)
      setupTokenRefresh() // 자동 갱신 시작
      console.log("[Auth] 로그인 성공 및 자동 갱신 시작")
    } catch (error) {
      throw error
    }
  }

  // 로그아웃
  const logout = async () => {
    try {
      // Interval 정리
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }

      await apiClient.post("/api/v1/auth/logout")

      // 다른 탭에 로그아웃 신호 전송
      localStorage.setItem("auth_logout", Date.now().toString())
      localStorage.removeItem("auth_logout")

      console.log("[Auth] 로그아웃 완료")
    } catch (error) {
      console.error("로그아웃 요청 실패:", error)
    } finally {
      setUser(null)
      router.push("/")
    }
  }

  // 사용자 정보 새로고침
  const refreshUser = async () => {
    await fetchUser()
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
