"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Play, Info } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function LandingPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/browse")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || isAuthenticated) {
    return null
  }

  return (
    <div className="relative min-h-screen bg-background">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent">
        <div className="container mx-auto flex items-center justify-between px-4 py-6 md:px-8">
          <Link href="/" className="text-3xl font-bold tracking-tight text-primary">
            STREAMLY
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-foreground hover:text-foreground/80">
                로그인
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative h-[90vh] w-full">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img src="/cinematic-movie-scene-dark-atmospheric.jpg" alt="Hero background" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="container relative mx-auto flex h-full items-center px-4 md:px-8">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-5xl font-bold leading-tight text-balance md:text-6xl lg:text-7xl">
              무제한 영화, TV 프로그램 등
            </h1>
            <p className="text-xl text-muted-foreground md:text-2xl">
              다양한 디바이스에서 시청하세요. 언제든지 해지 가능합니다.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/browse">
                <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Play className="h-5 w-5" fill="currentColor" />
                  지금 시청하기
                </Button>
              </Link>
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 bg-secondary/50 backdrop-blur-sm hover:bg-secondary/70"
              >
                <Info className="h-5 w-5" />
                상세 정보
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="border-t border-border/50 bg-background py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid gap-12 md:grid-cols-3">
            <div className="space-y-4 text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">TV로 즐기세요</h3>
              <p className="text-muted-foreground leading-relaxed">
                스마트 TV, PlayStation, Xbox, Chromecast, Apple TV 등 다양한 디바이스에서 시청하세요.
              </p>
            </div>

            <div className="space-y-4 text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">언제 어디서나 다운로드</h3>
              <p className="text-muted-foreground leading-relaxed">
                좋아하는 프로그램을 다운로드해서 오프라인으로 시청하세요.
              </p>
            </div>

            <div className="space-y-4 text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">모두를 위한 프로필</h3>
              <p className="text-muted-foreground leading-relaxed">
                자녀 전용 프로필을 만들어 연령별 등급이 적용된 콘텐츠를 즐기세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/50 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center md:px-8">
          <h2 className="text-4xl font-bold text-balance mb-6 md:text-5xl">준비되셨나요? 지금 시작하세요.</h2>
          <p className="text-xl text-muted-foreground mb-8">언제든지 멤버십을 해지할 수 있습니다.</p>
          <Link href="/login">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              시작하기
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/50 py-12">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h4 className="font-semibold mb-4">회사</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    소개
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    채용
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    투자 정보
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">고객 지원</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    고객 센터
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    미디어 센터
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    이용 약관
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">계정</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    계정 관리
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    개인정보 처리방침
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    법적 고지
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">소셜</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Facebook
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Instagram
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Twitter
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 Streamly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
