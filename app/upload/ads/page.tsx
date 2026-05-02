"use client"

import type React from "react"
import { useState, useRef, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { BrowseHeader } from "@/components/browse-header"
import { Play, Pause, Plus, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { videoApi, toMediaUrl, type Video } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface AdMarker {
  id: string
  startTime: number
  endTime: number
  category: string
}

const AD_CATEGORIES = [
  { value: "laptop", label: "노트북", color: "bg-blue-500" },
  { value: "refrigerator", label: "냉장고", color: "bg-cyan-500" },
  { value: "chair", label: "의자", color: "bg-purple-500" },
  { value: "smartphone", label: "스마트폰", color: "bg-pink-500" },
  { value: "tv", label: "TV", color: "bg-orange-500" },
  { value: "car", label: "자동차", color: "bg-red-500" },
  { value: "fashion", label: "패션/의류", color: "bg-yellow-500" },
  { value: "food", label: "식품", color: "bg-green-500" },
  { value: "beauty", label: "뷰티", color: "bg-rose-500" },
  { value: "home", label: "홈/인테리어", color: "bg-amber-500" },
]

export default function AdSetupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <AdSetupContent />
    </Suspense>
  )
}

function AdSetupContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const videoId = searchParams.get("videoId")

  const [video, setVideo] = useState<Video | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [adMarkers, setAdMarkers] = useState<AdMarker[]>([])
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null)
  const [isAddingMarker, setIsAddingMarker] = useState(false)
  const [newMarkerStart, setNewMarkerStart] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!videoId) return

    const parsedId = Number(videoId)
    if (!Number.isFinite(parsedId) || parsedId <= 0) {
      toast({ title: "오류", description: "유효하지 않은 videoId입니다.", variant: "destructive" })
      return
    }

    const controller = new AbortController()
    videoApi
      .getVideoById(parsedId)
      .then((data) => {
        if (!controller.signal.aborted) setVideo(data)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        const message = err instanceof Error ? err.message : "영상 정보를 불러오지 못했습니다."
        toast({ title: "영상 로드 실패", description: message, variant: "destructive" })
      })

    return () => controller.abort()
  }, [videoId, toast])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return

    const rect = timelineRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const time = percentage * duration

    if (isAddingMarker) {
      if (newMarkerStart === null) {
        // Set start time
        setNewMarkerStart(time)
      } else {
        // Set end time and create marker
        const startTime = Math.min(newMarkerStart, time)
        const endTime = Math.max(newMarkerStart, time)

        const newMarker: AdMarker = {
          id: Date.now().toString(),
          startTime,
          endTime,
          category: "laptop", // Default category
        }

        setAdMarkers([...adMarkers, newMarker])
        setNewMarkerStart(null)
        setIsAddingMarker(false)
        setSelectedMarker(newMarker.id)
      }
    } else {
      setCurrentTime(time)
    }
  }

  const handleMarkerCategoryChange = (markerId: string, category: string) => {
    setAdMarkers(adMarkers.map((marker) => (marker.id === markerId ? { ...marker, category } : marker)))
  }

  const handleDeleteMarker = (markerId: string) => {
    setAdMarkers(adMarkers.filter((marker) => marker.id !== markerId))
    if (selectedMarker === markerId) {
      setSelectedMarker(null)
    }
  }

  const handleStartAddingMarker = () => {
    setIsAddingMarker(true)
    setNewMarkerStart(null)
  }

  const handleCancelAddingMarker = () => {
    setIsAddingMarker(false)
    setNewMarkerStart(null)
  }

  const handleSubmit = async () => {
    if (!videoId) {
      toast({ title: "오류", description: "videoId가 없습니다.", variant: "destructive" })
      return
    }
    const parsedId = Number(videoId)
    if (!Number.isFinite(parsedId) || parsedId <= 0) {
      toast({ title: "오류", description: "유효하지 않은 videoId입니다.", variant: "destructive" })
      return
    }
    if (adMarkers.length === 0) {
      toast({ title: "오류", description: "광고 구간을 하나 이상 추가해주세요.", variant: "destructive" })
      return
    }

    try {
      setSubmitting(true)

      const results = await Promise.allSettled(
        adMarkers.map((marker) => {
          const h = Math.floor(marker.startTime / 3600)
          const m = Math.floor((marker.startTime % 3600) / 60)
          const s = Math.floor(marker.startTime % 60)
          const startTimeFormatted = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
          const durationSecs = Math.round(marker.endTime - marker.startTime)
          // BE returns 202 Accepted with no body — post<void> avoids JSON parse errors
          return apiClient.post<void>(
            `/api/v1/videos/${parsedId}/ai-fetch?startTime=${startTimeFormatted}&duration=${durationSecs}`
          )
        })
      )

      const failed = results.filter((r): r is PromiseRejectedResult => r.status === "rejected")
      const succeeded = results.length - failed.length

      if (failed.length === 0) {
        toast({
          title: "요청 완료",
          description: `${succeeded}개 구간이 AI 처리 대기열에 추가됐습니다. 백그라운드에서 처리됩니다.`,
        })
        router.push("/my-videos")
      } else if (succeeded > 0) {
        toast({
          title: "일부 실패",
          description: `${succeeded}건 성공, ${failed.length}건 실패했습니다. 실패한 구간을 확인 후 다시 시도해주세요.`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "오류",
          description: "모든 광고 구간 전송에 실패했습니다. 다시 시도해주세요.",
          variant: "destructive",
        })
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."
      toast({ title: "오류", description: message, variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <BrowseHeader />

      <div className="container mx-auto px-4 py-24 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-4xl font-bold">광고 구간 설정</h1>
            <Link href="/upload">
              <Button variant="outline">뒤로가기</Button>
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Video Preview and Timeline */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Player */}
              <div className="overflow-hidden rounded-lg border border-border bg-black">
                <div className="relative aspect-video bg-black">
                  {video && (toMediaUrl(video.cloudfrontUrl) || toMediaUrl(video.s3Url)) ? (
                    <video
                      ref={videoRef}
                      className="h-full w-full"
                      src={(toMediaUrl(video.cloudfrontUrl) || toMediaUrl(video.s3Url))!}
                      onLoadedMetadata={(e) => setDuration((e.target as HTMLVideoElement).duration)}
                      onTimeUpdate={(e) => setCurrentTime((e.target as HTMLVideoElement).currentTime)}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <FileVideo className="mx-auto mb-4 h-16 w-16" />
                        <p>영상 미리보기</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-16 w-16 rounded-full bg-black/50 hover:bg-black/70"
                      onClick={() => {
                        if (videoRef.current) {
                          isPlaying ? videoRef.current.pause() : videoRef.current.play()
                        }
                      }}
                    >
                      {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" fill="currentColor" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-6">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">타임라인</Label>
                  <div className="flex gap-2">
                    {!isAddingMarker ? (
                      <Button size="sm" onClick={handleStartAddingMarker}>
                        <Plus className="mr-2 h-4 w-4" />
                        광고 구간 추가
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {newMarkerStart === null ? "시작 지점을 선택하세요" : "종료 지점을 선택하세요"}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={handleCancelAddingMarker}>
                          취소
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline bar */}
                <div className="space-y-2">
                  <div
                    ref={timelineRef}
                    className="relative h-20 cursor-pointer overflow-hidden rounded-md bg-muted"
                    onClick={handleTimelineClick}
                  >
                    {/* Time grid */}
                    <div className="absolute inset-0 flex">
                      {Array.from({ length: 11 }).map((_, i) => (
                        <div key={i} className="flex-1 border-r border-muted-foreground/10">
                          <div className="px-1 py-1 text-xs text-muted-foreground">
                            {formatTime((duration * i) / 10)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Ad markers */}
                    {adMarkers.map((marker) => {
                      const startPercent = (marker.startTime / duration) * 100
                      const widthPercent = ((marker.endTime - marker.startTime) / duration) * 100
                      const category = AD_CATEGORIES.find((cat) => cat.value === marker.category)

                      return (
                        <div
                          key={marker.id}
                          className={`absolute top-0 h-full cursor-pointer border-2 ${category?.color} opacity-60 transition-opacity hover:opacity-80 ${
                            selectedMarker === marker.id ? "ring-2 ring-white ring-offset-2" : ""
                          }`}
                          style={{
                            left: `${startPercent}%`,
                            width: `${widthPercent}%`,
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedMarker(marker.id)
                          }}
                        />
                      )
                    })}

                    {/* Current time indicator */}
                    <div
                      className="absolute top-0 h-full w-0.5 bg-red-500"
                      style={{
                        left: `${(currentTime / duration) * 100}%`,
                      }}
                    >
                      <div className="absolute -top-1 -left-2 h-3 w-5 rounded-sm bg-red-500" />
                    </div>

                    {/* New marker preview */}
                    {isAddingMarker && newMarkerStart !== null && (
                      <div
                        className="absolute top-0 h-full border-2 border-dashed border-white bg-white/20"
                        style={{
                          left: `${(newMarkerStart / duration) * 100}%`,
                          width: "2px",
                        }}
                      />
                    )}
                  </div>

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ad Markers List */}
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/20 p-6">
                <h2 className="mb-4 text-xl font-semibold">광고 구간 목록</h2>

                {adMarkers.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <p>설정된 광고 구간이 없습니다.</p>
                    <p className="mt-2 text-sm">타임라인에서 광고 구간을 추가해보세요.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {adMarkers.map((marker) => {
                      const category = AD_CATEGORIES.find((cat) => cat.value === marker.category)

                      return (
                        <div
                          key={marker.id}
                          className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                            selectedMarker === marker.id
                              ? "border-primary bg-primary/5"
                              : "border-border bg-background hover:bg-muted/50"
                          }`}
                          onClick={() => setSelectedMarker(marker.id)}
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <div className="font-medium">
                              {formatTime(marker.startTime)} - {formatTime(marker.endTime)}
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteMarker(marker.id)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">광고 카테고리</Label>
                            <select
                              value={marker.category}
                              onChange={(e) => handleMarkerCategoryChange(marker.id, e.target.value)}
                              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {AD_CATEGORIES.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                  {cat.label}
                                </option>
                              ))}
                            </select>
                            <Badge className={`${category?.color} text-white`}>{category?.label}</Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Category Legend */}
              <div className="rounded-lg border border-border bg-muted/20 p-6">
                <h3 className="mb-3 font-semibold">카테고리 목록</h3>
                <div className="flex flex-wrap gap-2">
                  {AD_CATEGORIES.map((cat) => (
                    <Badge key={cat.value} className={`${cat.color} text-white`}>
                      {cat.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Button onClick={handleSubmit} className="w-full bg-red-600 hover:bg-red-700" disabled={adMarkers.length === 0 || submitting}>
                  {submitting
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />처리 중...</>
                    : "업로드 완료"
                  }
                </Button>
                <Link href="/upload" className="w-full">
                  <Button variant="outline" className="w-full bg-transparent">
                    이전 단계로
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FileVideo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="m10 11 5 3-5 3v-6Z" />
    </svg>
  )
}
