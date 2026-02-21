"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ProfilesPage() {
  const router = useRouter()

  useEffect(() => {
    // 단일 프로필 시스템으로 변경되었으므로 /browse로 리다이렉트
    router.push("/browse")
  }, [router])

  return null
}
