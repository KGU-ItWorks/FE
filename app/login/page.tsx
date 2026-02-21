"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { apiClient } from "@/lib/api-client"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { login, refreshUser, isAuthenticated } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  })

  // 이미 로그인된 상태라면 /browse로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/browse")
    }
  }, [isAuthenticated, router])

  // OAuth 리다이렉트 후 처리
  useEffect(() => {
    const checkAuthStatus = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const loginSuccess = urlParams.get("login")
      const error = urlParams.get("error")

      if (error) {
        toast({
          title: "로그인 실패",
          description: decodeURIComponent(error),
          variant: "destructive",
        })
        return
      }

      if (loginSuccess === "success") {
        try {
          await refreshUser()
          toast({
            title: "로그인 성공",
            description: "환영합니다!",
          })
          router.push("/browse")
        } catch (err) {
          console.error("User refresh failed:", err)
          toast({
            title: "오류",
            description: "사용자 정보를 불러오는데 실패했습니다.",
            variant: "destructive",
          })
        }
      }
    }

    checkAuthStatus()
  }, [refreshUser, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isSignUp) {
        // 회원가입 - apiClient 사용
        await apiClient.post("/api/v1/auth/signup", {
          email: formData.email,
          password: formData.password,
          name: formData.name,
        })

        toast({
          title: "회원가입 완료",
          description: "회원가입이 완료되었습니다. 로그인해주세요.",
        })

        // 회원가입 성공 후 로그인 폼으로 전환
        setIsSignUp(false)
        setFormData({ email: formData.email, password: "", name: "" })
      } else {
        // 로그인 - AuthContext 사용 (내부적으로 apiClient 사용)
        await login(formData.email, formData.password)

        toast({
          title: "로그인 성공",
          description: "환영합니다!",
        })

        // 로그인 성공 후 browse 페이지로 이동
        router.push("/browse")
      }
    } catch (error) {
      toast({
        title: isSignUp ? "회원가입 실패" : "로그인 실패",
        description: error instanceof Error ? error.message : "오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = (provider: "google" | "kakao") => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://streamlyai.store'
    const oauthUrl = `${apiUrl}/oauth2/authorization/${provider}`
    window.location.href = oauthUrl
  }

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="absolute inset-0">
        <img src="/dark-cinematic-texture-background.jpg" alt="Background" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-gradient-to-b from-black/80 to-transparent">
        <div className="container mx-auto flex items-center justify-between px-4 py-6 md:px-8">
          <Link href="/" className="text-3xl font-bold tracking-tight text-primary">
            STREAMLY
          </Link>
        </div>
      </header>

      {/* Login Form */}
      <div className="relative z-10 container mx-auto flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6 rounded-md bg-black/75 p-8 md:p-12">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{isSignUp ? "회원가입" : "로그인"}</h1>
            <p className="text-muted-foreground">{isSignUp ? "새 계정을 만들어보세요" : "계정에 로그인하세요"}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="이름을 입력하세요"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-secondary border-border text-foreground"
                  required
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="이메일을 입력하세요"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-secondary border-border text-foreground"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-secondary border-border text-foreground"
                required
                disabled={isLoading}
              />
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-end">
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  비밀번호를 잊으셨나요?
                </Link>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? "처리 중..." : isSignUp ? "회원가입" : "로그인"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black/75 px-2 text-muted-foreground">또는</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 w-full h-9 px-4 py-2 bg-white text-black hover:bg-gray-100 border-0 shadow-sm cursor-pointer"
              onClick={() => handleOAuthLogin("google")}
              disabled={isLoading}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google로 {isSignUp ? "가입하기" : "로그인"}
            </button>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 w-full h-9 px-4 py-2 bg-[#FEE500] text-[#000000] hover:bg-[#FDD835] border-0 shadow-sm cursor-pointer"
              onClick={() => handleOAuthLogin("kakao")}
              disabled={isLoading}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.486 3 2 6.364 2 10.5c0 2.565 1.67 4.815 4.168 6.167l-1.098 4.045c-.064.237.09.478.326.478a.41.41 0 00.195-.049l4.708-3.124c.567.066 1.146.101 1.701.101 5.514 0 10-3.364 10-7.5S17.514 3 12 3z" />
              </svg>
              카카오로 {isSignUp ? "가입하기" : "로그인"}
            </button>
          </div>

          <div className="space-y-4 text-center text-sm">
            <p className="text-muted-foreground">
              {isSignUp ? "이미 계정이 있으신가요? " : "Streamly 회원이 아니신가요? "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setFormData({ email: "", password: "", name: "" })
                }}
                className="text-foreground hover:underline font-medium"
                disabled={isLoading}
              >
                {isSignUp ? "로그인하기" : "지금 가입하세요"}
              </button>
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              이 페이지는 Google reCAPTCHA의 보호를 받아 로봇이 아님을 확인합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
