"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Pencil, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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

export default function ManageProfilesPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState(MOCK_PROFILES)
  const [editingProfile, setEditingProfile] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [profileToDelete, setProfileToDelete] = useState<number | null>(null)

  const handleDeleteProfile = () => {
    if (profileToDelete !== null) {
      setProfiles(profiles.filter((p) => p.id !== profileToDelete))
      setDeleteDialogOpen(false)
      setProfileToDelete(null)
    }
  }

  const openDeleteDialog = (id: number) => {
    setProfileToDelete(id)
    setDeleteDialogOpen(true)
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
          <Link href="/profiles">
            <Button variant="ghost" className="gap-2 text-foreground hover:text-foreground/80">
              <ChevronLeft className="h-5 w-5" />
              뒤로가기
            </Button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-medium text-foreground mb-8 md:text-5xl">프로필 관리</h1>

          <div className="space-y-6">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center gap-6 rounded-lg bg-muted/30 p-6 transition-colors hover:bg-muted/50"
              >
                <img
                  src={profile.avatar || "/placeholder.svg"}
                  alt={profile.name}
                  className="h-20 w-20 rounded-md object-cover md:h-24 md:w-24"
                />

                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground">{profile.name}</h3>
                  {profile.isKids && (
                    <p className="text-sm text-muted-foreground mt-1">어린이 프로필 • 연령 등급 적용</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditingProfile(profile.id)}
                    className="border-muted hover:bg-muted"
                  >
                    <Pencil className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openDeleteDialog(profile.id)}
                    className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}

            <Button
              onClick={() => router.push("/profiles/create")}
              variant="outline"
              className="w-full border-dashed border-2 border-muted-foreground/30 py-8 hover:border-foreground hover:bg-muted/30"
            >
              + 프로필 추가
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>프로필 삭제</DialogTitle>
            <DialogDescription>정말로 이 프로필을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDeleteProfile}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
