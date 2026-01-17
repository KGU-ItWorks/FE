"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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

export function BrowseHeader() {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)

  // Handle scroll effect
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      setIsScrolled(window.scrollY > 0)
    })
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isScrolled ? "bg-background" : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-4 md:px-12">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold tracking-tight text-primary md:text-3xl">
            STREAMLY
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/browse" className="text-sm font-medium text-foreground hover:text-muted-foreground">
              홈
            </Link>
            <Link href="/category/series" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              시리즈
            </Link>
            <Link href="/category/movie" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              영화
            </Link>
            <Link href="/category/korean" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              한국 콘텐츠
            </Link>
            {/* </CHANGE> */}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/search">
            <Button variant="ghost" size="icon" className="text-foreground hover:text-muted-foreground">
              <Search className="h-5 w-5" />
            </Button>
          </Link>

          <Link href="/upload">
            <Button variant="ghost" size="icon" className="text-foreground hover:text-muted-foreground">
              <Upload className="h-5 w-5" />
            </Button>
          </Link>
          {/* </CHANGE> */}

          <Button variant="ghost" size="icon" className="text-foreground hover:text-muted-foreground">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/profile-avatar-1.jpg" alt="Profile" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-black/95 border-border">
              <DropdownMenuItem onClick={() => router.push("/profiles")} className="cursor-pointer">
                프로필 전환
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/profiles/manage")} className="cursor-pointer">
                프로필 관리
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">계정</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">고객 센터</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem onClick={() => router.push("/")} className="cursor-pointer">
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
