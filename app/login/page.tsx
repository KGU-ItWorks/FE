"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function LoginPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Backend integration will be added later
    router.push("/profiles")
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
              />
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                    로그인 상태 유지
                  </label>
                </div>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  도움이 필요하신가요?
                </Link>
              </div>
            )}

            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {isSignUp ? "회원가입" : "로그인"}
            </Button>
          </form>

          <div className="space-y-4 text-center text-sm">
            <p className="text-muted-foreground">
              {isSignUp ? "이미 계정이 있으신가요? " : "Streamly 회원이 아니신가요? "}
              <button onClick={() => setIsSignUp(!isSignUp)} className="text-foreground hover:underline font-medium">
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
