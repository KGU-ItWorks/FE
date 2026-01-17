"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Edit, Plus } from "lucide-react"

const MOCK_PROFILES = [
  {
    id: 1,
    name: "김철수",
    avatar: "/profile-avatar-1.jpg",
    isKids: false,
  },
  {
    id: 2,
    name: "김영희",
    avatar: "/profile-avatar-2.jpg",
    isKids: false,
  },
  {
    id: 3,
    name: "어린이",
    avatar: "/profile-avatar-kids.jpg",
    isKids: true,
  },
]

export default function ProfilesPage() {
  const router = useRouter()
  const [isManaging, setIsManaging] = useState(false)

  const handleProfileClick = (profileId: number) => {
    if (isManaging) {
      router.push(`/profiles/manage/${profileId}`)
    } else {
      router.push("/browse")
    }
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
      <div className="relative z-10 container mx-auto flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl text-center">
          <h1 className="text-5xl font-medium text-foreground mb-12 md:text-6xl">
            {isManaging ? "프로필 관리" : "시청할 프로필을 선택하세요."}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
            {MOCK_PROFILES.map((profile) => (
              <button
                key={profile.id}
                onClick={() => handleProfileClick(profile.id)}
                className="group relative flex flex-col items-center gap-3 transition-transform hover:scale-110"
              >
                <div className="relative h-32 w-32 overflow-hidden rounded-md border-4 border-transparent group-hover:border-foreground transition-all md:h-40 md:w-40">
                  <img
                    src={profile.avatar || "/placeholder.svg"}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                  {isManaging && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <Edit className="h-8 w-8 text-foreground" />
                    </div>
                  )}
                </div>
                <span className="text-lg text-muted-foreground group-hover:text-foreground transition-colors md:text-xl">
                  {profile.name}
                </span>
              </button>
            ))}

            {/* Add Profile Button */}
            <button
              onClick={() => router.push("/profiles/create")}
              className="group relative flex flex-col items-center gap-3 transition-transform hover:scale-110"
            >
              <div className="relative h-32 w-32 overflow-hidden rounded-md border-4 border-transparent group-hover:border-foreground transition-all md:h-40 md:w-40 flex items-center justify-center bg-muted/30">
                <Plus className="h-16 w-16 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <span className="text-lg text-muted-foreground group-hover:text-foreground transition-colors md:text-xl">
                프로필 추가
              </span>
            </button>
          </div>

          <Button
            onClick={() => setIsManaging(!isManaging)}
            variant="outline"
            className="border-muted-foreground text-muted-foreground hover:border-foreground hover:text-foreground"
          >
            {isManaging ? "완료" : "프로필 관리"}
          </Button>
        </div>
      </div>
    </div>
  )
}
