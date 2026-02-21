"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Search, Bell, ChevronDown, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"

export function BrowseHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    await logout()
  }

  // 사용자 이름의 첫 글자를 Avatar fallback으로 사용
  const userInitial = user?.nickname?.charAt(0).toUpperCase() || "U"
  const userName = user?.nickname || "사용자"

  // 현재 경로가 특정 경로와 일치하는지 확인
  const isActive = (path: string) => {
    if (path === "/browse") {
      return pathname === "/browse"
    }
    return pathname?.startsWith(path)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isScrolled ? "bg-black" : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-4 md:px-12">
        <div className="flex items-center gap-8">
          <Link href="/browse" className="text-2xl font-bold tracking-tight text-red-600 md:text-3xl">
            STREAMLY
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link 
              href="/browse" 
              className={`text-sm font-medium transition ${
                isActive("/browse") 
                  ? "text-white font-bold" 
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              홈
            </Link>
            <Link 
              href="/category/series" 
              className={`text-sm font-medium transition ${
                pathname?.includes("/category/series")
                  ? "text-white font-bold" 
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              시리즈
            </Link>
            <Link 
              href="/category/movies" 
              className={`text-sm font-medium transition ${
                pathname?.includes("/category/movies")
                  ? "text-white font-bold" 
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              영화
            </Link>
            <Link 
              href="/category/all" 
              className={`text-sm font-medium transition ${
                pathname?.includes("/category/all")
                  ? "text-white font-bold" 
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              전체
            </Link>
            <Link 
              href="/my-videos" 
              className={`text-sm font-medium transition ${
                isActive("/my-videos") 
                  ? "text-white font-bold" 
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              내 영상
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/search">
            <Button variant="ghost" size="icon" className="text-white hover:text-gray-300">
              <Search className="h-5 w-5" />
            </Button>
          </Link>

          <Link href="/upload">
            <Button variant="ghost" size="icon" className="text-white hover:text-gray-300">
              <Upload className="h-5 w-5" />
            </Button>
          </Link>

          <Button variant="ghost" size="icon" className="text-white hover:text-gray-300">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-red-600 text-white">{userInitial}</AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-black/95 border-gray-800">
              {user && (
                <>
                  <div className="px-2 py-2 text-sm">
                    <p className="font-medium text-white">{userName}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-gray-800" />
                </>
              )}
              <Link href="/my-videos">
                <DropdownMenuItem className="cursor-pointer text-gray-300 hover:text-white">
                  내 영상
                </DropdownMenuItem>
              </Link>
              
              {/* ROLE_USER인 경우 업로더 승급 신청 링크 */}
              {user?.role === 'ROLE_USER' && (
                <Link href="/upgrade-to-uploader">
                  <DropdownMenuItem className="cursor-pointer text-yellow-400 hover:text-yellow-300">
                    ⭐ 업로더 신청하기
                  </DropdownMenuItem>
                </Link>
              )}
              
              <DropdownMenuItem className="cursor-pointer text-gray-300 hover:text-white">계정</DropdownMenuItem>
              
              {/* 관리자 메뉴 */}
              {user?.role === 'ROLE_ADMIN' && (
                <>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <Link href="/admin/dashboard">
                    <DropdownMenuItem className="cursor-pointer text-red-400 hover:text-red-300">
                      관리자 대시보드
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/admin/videos">
                    <DropdownMenuItem className="cursor-pointer text-red-400 hover:text-red-300">
                      영상 관리
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/admin/users">
                    <DropdownMenuItem className="cursor-pointer text-red-400 hover:text-red-300">
                      사용자 관리
                    </DropdownMenuItem>
                  </Link>
                </>
              )}
              
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem className="cursor-pointer text-gray-300 hover:text-white">고객 센터</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-gray-300 hover:text-white">
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
