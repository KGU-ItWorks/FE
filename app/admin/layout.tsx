'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Video, 
  Users, 
  Settings,
  Shield,
  Menu,
  X
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // 로딩 중이면 대기
    if (isLoading) {
      console.log('[Admin] Auth is loading...')
      return
    }

    console.log('[Admin] User:', user)
    console.log('[Admin] User role:', user?.role)

    // 로그인 안 되어 있으면 로그인 페이지로
    if (!user) {
      console.log('[Admin] No user, redirecting to login...')
      router.push('/login')
      return
    }

    // 관리자 권한 체크
    if (user.role !== 'ROLE_ADMIN') {
      console.log('[Admin] User role:', user.role, '- Not admin, redirecting to browse...')
      router.push('/browse')
      return
    }

    console.log('[Admin] User is admin, showing admin page')
    setChecking(false)
  }, [user, isLoading, router])

  // 로딩 중이거나 권한 체크 중이면 로딩 표시
  if (isLoading || checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">권한 확인 중...</p>
        </div>
      </div>
    )
  }

  // 권한 없으면 아무것도 렌더링 안 함 (리다이렉트 처리 중)
  if (!user || user.role !== 'ROLE_ADMIN') {
    return null
  }

  const navigation = [
    { name: '대시보드', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: '영상 관리', href: '/admin/videos', icon: Video },
    { name: '사용자 관리', href: '/admin/users', icon: Users },
    { name: '승급 신청', href: '/admin/uploader-requests', icon: Shield },
    { name: '설정', href: '/admin/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-card rounded-lg shadow-lg"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <Link href="/admin/dashboard">
              <h1 className="text-2xl font-bold text-red-600">STREAMLY</h1>
              <p className="text-sm text-muted-foreground">관리자 패널</p>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition
                    ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
                  `}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-border">
            <div className="mb-3 text-sm">
              <p className="font-medium">{user.nickname || user.email}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
            <Link href="/browse">
              <button className="w-full px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition">
                사용자 페이지로 돌아가기
              </button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="min-h-screen p-4 lg:p-8">
          {children}
        </div>
      </main>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}
