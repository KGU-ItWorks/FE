"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft } from "lucide-react"

const AVATAR_OPTIONS = [
  "/profile-avatar-1.jpg",
  "/profile-avatar-2.jpg",
  "/profile-avatar-kids.jpg",
  "/profile-avatar-alt-1.jpg",
  "/profile-avatar-alt-2.jpg",
  "/profile-avatar-alt-3.jpg",
]

export default function CreateProfilePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    isKids: false,
    selectedAvatar: AVATAR_OPTIONS[0],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Backend integration will be added later
    router.push("/profiles")
  }

  return (
    <div className="relative min-h-screen bg-background">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-black" />

      {/* Header */}
      <header className="relative z-10">
        <div className="container mx-auto flex items-center justify-between px-4 py-6 md:px-8">
          <Link href="/" className="text-3xl font-bold tracking-tight text-primary">
            STREAMLY
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-12 md:px-8">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/profiles/manage">
            <Button variant="ghost" className="gap-2 text-foreground hover:text-foreground/80">
              <ChevronLeft className="h-5 w-5" />
              뒤로가기
            </Button>
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-medium text-foreground mb-8 md:text-5xl">프로필 추가</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Avatar Selection */}
            <div className="space-y-4">
              <Label className="text-lg">프로필 아이콘</Label>
              <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
                {AVATAR_OPTIONS.map((avatar) => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => setFormData({ ...formData, selectedAvatar: avatar })}
                    className={`relative h-20 w-20 overflow-hidden rounded-md border-4 transition-all hover:scale-105 ${
                      formData.selectedAvatar === avatar ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img
                      src={avatar || "/placeholder.svg"}
                      alt="Avatar option"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-lg">
                이름
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="프로필 이름을 입력하세요"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-muted border-border text-foreground text-lg py-6"
                required
              />
            </div>

            {/* Kids Profile Checkbox */}
            <div className="flex items-center space-x-3 rounded-lg bg-muted/30 p-6">
              <Checkbox
                id="kids"
                checked={formData.isKids}
                onCheckedChange={(checked) => setFormData({ ...formData, isKids: checked as boolean })}
              />
              <div>
                <label htmlFor="kids" className="text-base font-medium cursor-pointer">
                  어린이 프로필
                </label>
                <p className="text-sm text-muted-foreground mt-1">12세 이하 어린이를 위한 콘텐츠만 표시됩니다.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" size="lg" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                저장
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={() => router.push("/profiles/manage")}
                className="flex-1"
              >
                취소
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
