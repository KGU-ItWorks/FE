'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Upload,
  Video,
  Menu,
  X,
  Megaphone,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function AdvertiserStudioLayout({
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
    if (isLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'ROLE_ADVERTISER' && user.role !== 'ROLE_ADMIN') {
      router.push('/browse')
      return
    }

    setChecking(false)
  }, [user, isLoading, router])

  if (isLoading || checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4" />
          <p className="text-muted-foreground">권한 확인 중...</p>
        </div>
      </div>
    )
  }

  if (!user || (user.role !== 'ROLE_ADVERTISER' && user.role !== 'ROLE_ADMIN')) {
    return null
  }

  const navigation = [
    { name: '대시보드', href: '/advertiser-studio', icon: LayoutDashboard },
    { name: '광고 영상 관리', href: '/advertiser-studio/videos', icon: Video },
    { name: '영상 업로드', href: '/advertiser-studio/upload', icon: Upload },
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
            <div className="flex items-center gap-2">
              <Megaphone className="h-6 w-6 text-yellow-500" />
              <div>
                <h1 className="text-xl font-bold text-yellow-500">광고주 스튜디오</h1>
                <p className="text-xs text-muted-foreground">STREAMLY for Advertisers</p>
              </div>
            </div>
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
                    ${isActive
                      ? 'bg-yellow-500 text-black font-semibold'
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
          <div className="p-4 border-t border-border space-y-3">
            <div className="text-sm">
              <p className="font-medium">{user.nickname || user.email}</p>
              <p className="text-xs text-muted-foreground">광고주</p>
            </div>
            <Link href="/browse">
              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition">
                <LogOut size={16} />
                소비자 페이지로 이동
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
