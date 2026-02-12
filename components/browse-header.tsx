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
                  ? "text-white" 
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              홈
            </Link>
            <Link 
              href="/category/시리즈" 
              className={`text-sm font-medium transition ${
                pathname === "/category/시리즈" 
                  ? "text-white" 
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              시리즈
            </Link>
            <Link 
              href="/category/영화" 
              className={`text-sm font-medium transition ${
                pathname === "/category/영화" 
                  ? "text-white" 
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              영화
            </Link>
            <Link 
              href="/category/전체" 
              className={`text-sm font-medium transition ${
                pathname === "/category/전체" 
                  ? "text-white" 
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              전체
            </Link>
            <Link 
              href="/my-videos" 
              className={`text-sm font-medium transition ${
                isActive("/my-videos") 
                  ? "text-white" 
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
              <DropdownMenuItem className="cursor-pointer text-gray-300 hover:text-white">계정</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-gray-300 hover:text-white">고객 센터</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-800" />
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
