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
import { addPendingComposition } from "@/hooks/use-composition-notifier"

interface AdMarker {
  id: string
  startTime: number
  endTime: number
  category: string
  prompt: string
}

const AD_CATEGORIES = [
  { value: "laptop",      label: "노트북",    englishPrompt: "laptop computer",  color: "bg-blue-500"   },
  { value: "smartphone",  label: "스마트폰",  englishPrompt: "smartphone",       color: "bg-pink-500"   },
  { value: "tv",          label: "TV",        englishPrompt: "television",       color: "bg-orange-500" },
  { value: "can",         label: "캔",        englishPrompt: "beverage can",     color: "bg-red-500"    },
  { value: "bottle",      label: "병",        englishPrompt: "bottle",     color: "bg-red-400"    },
  { value: "snack",       label: "간식",      englishPrompt: "snack food",       color: "bg-yellow-500" },
  { value: "food",        label: "식품",      englishPrompt: "food",             color: "bg-green-500"  },
  { value: "beauty",      label: "뷰티",      englishPrompt: "beauty product",   color: "bg-rose-500"   },
]

/** M:SS  →  e.g.  "1:23" */
const formatTime = (seconds: number) => {
  if (!isFinite(seconds) || seconds < 0) return "0:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, "0")}`
}

/** Total seconds (integer)  →  e.g.  "83s" */
const formatSec = (seconds: number) => `${Math.round(seconds)}s`

export default function AdSetupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <AdSetupContent />
    </Suspense>
  )
}

function AdSetupContent() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const { toast }    = useToast()
  const videoId      = searchParams.get("videoId")

  const [video,          setVideo]          = useState<Video | null>(null)
  const [isPlaying,      setIsPlaying]      = useState(false)
  const [currentTime,    setCurrentTime]    = useState(0)
  const [duration,       setDuration]       = useState(0)
  const [adMarkers,      setAdMarkers]      = useState<AdMarker[]>([])
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null)
  const [isAddingMarker, setIsAddingMarker] = useState(false)
  const [newMarkerStart, setNewMarkerStart] = useState<number | null>(null)
  const [hoverTime,      setHoverTime]      = useState<number | null>(null)
  const [submitting,     setSubmitting]     = useState(false)

  const videoRef    = useRef<HTMLVideoElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  // ── Video load ────────────────────────────────────────────────────────────
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
        if (controller.signal.aborted) return
        const playableUrl = toMediaUrl(data.cloudfrontUrl) || toMediaUrl(data.s3Url)
        const canConfigure =
          data.approvalStatus === "APPROVED" &&
          (data.status === "UPLOADED" || data.status === "COMPLETED") &&
          !!playableUrl
        if (!canConfigure) {
          toast({
            title: "접근 불가",
            description: "광고 설정은 승인된 업로드 영상에서만 가능합니다.",
            variant: "destructive",
          })
          router.replace("/my-videos")
          return
        }
        setVideo(data)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        const message = err instanceof Error ? err.message : "영상 정보를 불러오지 못했습니다."
        toast({ title: "영상 로드 실패", description: message, variant: "destructive" })
      })
    return () => controller.abort()
  }, [videoId, toast, router])

  // ── Timeline helpers ──────────────────────────────────────────────────────
  const getTimeFromEvent = (e: React.MouseEvent<HTMLDivElement>): number | null => {
    if (!timelineRef.current || duration <= 0) return null
    const rect = timelineRef.current.getBoundingClientRect()
    const x    = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    return (x / rect.width) * duration
  }

  const handleTimelineMouseMove  = (e: React.MouseEvent<HTMLDivElement>) => setHoverTime(getTimeFromEvent(e))
  const handleTimelineMouseLeave = () => setHoverTime(null)

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const t = getTimeFromEvent(e)
    if (t === null) return

    if (isAddingMarker) {
      if (newMarkerStart === null) {
        setNewMarkerStart(t)
      } else {
        const startTime       = Math.round(Math.min(newMarkerStart, t))
        const endTime         = Math.round(Math.max(newMarkerStart, t))
        const defaultCategory = "laptop"
        const defaultEnglish  = AD_CATEGORIES.find(c => c.value === defaultCategory)?.englishPrompt ?? defaultCategory
        const newMarker: AdMarker = {
          id: Date.now().toString(),
          startTime,
          endTime,
          category: defaultCategory,
          prompt:   defaultEnglish,
        }
        setAdMarkers(prev => [...prev, newMarker])
        setNewMarkerStart(null)
        setIsAddingMarker(false)
        setSelectedMarker(newMarker.id)
      }
    } else {
      // Seek video
      if (videoRef.current) videoRef.current.currentTime = t
      setCurrentTime(t)
    }
  }

  // ── Marker edits ──────────────────────────────────────────────────────────
  const handleMarkerCategoryChange = (markerId: string, category: string) => {
    const englishPrompt = AD_CATEGORIES.find(c => c.value === category)?.englishPrompt ?? category
    setAdMarkers(prev =>
      prev.map(m => m.id === markerId ? { ...m, category, prompt: englishPrompt } : m)
    )
  }

  const handleMarkerPromptChange = (markerId: string, raw: string) => {
    // Strip non-English characters — allow only a-z, A-Z, and spaces
    const cleaned = raw.replace(/[^a-zA-Z ]/g, '')
    // Count non-empty words
    const words = cleaned.trim().split(/\s+/).filter(Boolean)
    // Cap at 3 words; don't allow trailing space when already at 3 words
    let limited = words.length > 3 ? words.slice(0, 3).join(' ') : cleaned
    if (words.length >= 3) limited = limited.trimEnd()
    setAdMarkers(prev => prev.map(m => m.id === markerId ? { ...m, prompt: limited } : m))
  }

  const handleMarkerTimeChange = (
    markerId: string,
    field: "startTime" | "endTime",
    raw: string,
  ) => {
    const value = Math.round(parseFloat(raw))
    if (isNaN(value)) return
    setAdMarkers(prev =>
      prev.map(m => {
        if (m.id !== markerId) return m
        const clamped = Math.max(0, Math.min(value, Math.floor(duration)))
        const updated = { ...m, [field]: clamped }
        if (updated.startTime > updated.endTime) {
          // Swap so the range stays valid instead of collapsing to 0s
          ;[updated.startTime, updated.endTime] = [updated.endTime, updated.startTime]
        }
        return updated
      })
    )
  }

  const handleDeleteMarker = (markerId: string) => {
    setAdMarkers(prev => prev.filter(m => m.id !== markerId))
    if (selectedMarker === markerId) setSelectedMarker(null)
  }

  // ── Submit ────────────────────────────────────────────────────────────────
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
    const emptyPrompt = adMarkers.find(m => !m.prompt.trim())
    if (emptyPrompt) {
      toast({ title: "오류", description: "모든 구간에 AI 프롬프트를 입력해주세요.", variant: "destructive" })
      return
    }

    try {
      setSubmitting(true)
      const results = await Promise.allSettled(
        adMarkers.map(async (marker) => {
          const h = Math.floor(marker.startTime / 3600)
          const m = Math.floor((marker.startTime % 3600) / 60)
          const s = Math.floor(marker.startTime % 60)
          const startTimeFormatted = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
          const durationSecs       = Math.round(marker.endTime - marker.startTime)
          const data = await apiClient.post<{ compositionId: number }>(
            `/api/v1/video-compositions/${parsedId}/ai-fetch?startTime=${startTimeFormatted}&duration=${durationSecs}&objectPrompt=${encodeURIComponent(marker.prompt || marker.category)}`
          )
          addPendingComposition({
            compositionId: data.compositionId,
            videoId:       parsedId,
            videoTitle:    video?.title ?? `영상 #${parsedId}`,
          })
        })
      )

      const failed    = results.filter((r): r is PromiseRejectedResult => r.status === "rejected")
      const succeeded = results.length - failed.length

      if (failed.length === 0) {
        toast({ title: "요청 완료", description: `${succeeded}개 구간이 AI 처리 대기열에 추가됐습니다. 백그라운드에서 처리됩니다.` })
        router.push("/my-videos")
      } else if (succeeded > 0) {
        toast({ title: "일부 실패", description: `${succeeded}건 성공, ${failed.length}건 실패했습니다.`, variant: "destructive" })
      } else {
        toast({ title: "오류", description: "모든 광고 구간 전송에 실패했습니다. 다시 시도해주세요.", variant: "destructive" })
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."
      toast({ title: "오류", description: message, variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
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
            {/* ── Left: Video + Timeline ── */}
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
                      onTimeUpdate={(e)    => setCurrentTime((e.target as HTMLVideoElement).currentTime)}
                      onPlay={()  => setIsPlaying(true)}
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
                        if (!videoRef.current) return
                        isPlaying ? videoRef.current.pause() : videoRef.current.play()
                      }}
                    >
                      {isPlaying
                        ? <Pause className="h-8 w-8" />
                        : <Play  className="h-8 w-8" fill="currentColor" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <Label className="text-lg font-semibold">타임라인</Label>
                    {/* Live playback clock */}
                    <span className="text-sm font-mono text-muted-foreground tabular-nums">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  {!isAddingMarker ? (
                    <Button
                      size="sm"
                      onClick={() => { setIsAddingMarker(true); setNewMarkerStart(null) }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      광고 구간 추가
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={newMarkerStart === null ? "secondary" : "default"}
                        className="font-mono text-xs"
                      >
                        {newMarkerStart === null
                          ? "① 시작 지점을 클릭하세요"
                          : `시작 ${formatSec(newMarkerStart)} → ② 종료 지점을 클릭하세요`}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setIsAddingMarker(false); setNewMarkerStart(null) }}
                      >
                        취소
                      </Button>
                    </div>
                  )}
                </div>

                {/* Timeline bar */}
                <div className="space-y-1">
                  <div
                    ref={timelineRef}
                    className={`relative h-20 overflow-hidden rounded-md bg-muted select-none ${
                      isAddingMarker ? "cursor-crosshair" : "cursor-pointer"
                    }`}
                    onClick={handleTimelineClick}
                    onMouseMove={handleTimelineMouseMove}
                    onMouseLeave={handleTimelineMouseLeave}
                  >
                    {/* Time grid labels */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      {Array.from({ length: 11 }).map((_, i) => (
                        <div key={i} className="flex-1 border-r border-muted-foreground/10">
                          <div className="px-1 py-1 text-[10px] text-muted-foreground/60 font-mono">
                            {formatTime((duration * i) / 10)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Ad marker blocks */}
                    {adMarkers.map((marker) => {
                      const startPct = (marker.startTime / duration) * 100
                      const widthPct = ((marker.endTime - marker.startTime) / duration) * 100
                      const cat      = AD_CATEGORIES.find(c => c.value === marker.category)
                      return (
                        <div
                          key={marker.id}
                          className={`absolute top-0 h-full cursor-pointer border-2 ${cat?.color ?? "bg-gray-500"} opacity-60 transition-opacity hover:opacity-80 ${
                            selectedMarker === marker.id ? "ring-2 ring-white ring-offset-1 opacity-80" : ""
                          }`}
                          style={{
                            left:  `${startPct}%`,
                            width: `${Math.max(widthPct, 0.4)}%`,
                          }}
                          onClick={(e) => { e.stopPropagation(); setSelectedMarker(marker.id) }}
                        />
                      )
                    })}

                    {/* Playback position */}
                    <div
                      className="absolute top-0 h-full w-px bg-red-500 pointer-events-none"
                      style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                    >
                      <div className="absolute -top-0 -left-1.5 h-3 w-3 rounded-full bg-red-500" />
                    </div>

                    {/* Duration preview (start → hover) while selecting end point */}
                    {isAddingMarker && newMarkerStart !== null && hoverTime !== null && duration > 0 && (
                      <div
                        className="absolute top-0 h-full bg-yellow-400/25 border border-dashed border-yellow-400/70 pointer-events-none"
                        style={{
                          left:  `${(Math.min(newMarkerStart, hoverTime) / duration) * 100}%`,
                          width: `${(Math.abs(hoverTime - newMarkerStart) / duration) * 100}%`,
                        }}
                      />
                    )}

                    {/* Start point pin (yellow) */}
                    {isAddingMarker && newMarkerStart !== null && duration > 0 && (
                      <div
                        className="absolute top-0 h-full pointer-events-none"
                        style={{ left: `${(newMarkerStart / duration) * 100}%` }}
                      >
                        <div className="absolute top-0 h-full w-px bg-yellow-400" />
                        <div className="absolute top-2 left-1 bg-yellow-500/90 text-black text-[10px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap shadow">
                          시작 {formatSec(newMarkerStart)}
                        </div>
                      </div>
                    )}

                    {/* Hover time tooltip */}
                    {hoverTime !== null && duration > 0 && (
                      <div
                        className="absolute top-0 h-full pointer-events-none"
                        style={{ left: `${(hoverTime / duration) * 100}%` }}
                      >
                        <div className="absolute top-0 h-full w-px bg-white/40" />
                        <div className="absolute bottom-2 left-1 bg-black/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap shadow">
                          {formatSec(hoverTime)}
                          {isAddingMarker && newMarkerStart !== null
                            ? ` (${formatSec(Math.abs(hoverTime - newMarkerStart))} 구간)`
                            : ""}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Second-scale labels below bar */}
                  <div className="flex justify-between text-[10px] text-muted-foreground font-mono px-0.5">
                    <span>0s</span>
                    {duration > 0 && <span>{formatSec(duration / 4)}</span>}
                    {duration > 0 && <span>{formatSec(duration / 2)}</span>}
                    {duration > 0 && <span>{formatSec(duration * 0.75)}</span>}
                    {duration > 0 && <span>{formatSec(duration)}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right: Marker list ── */}
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
                      const cat      = AD_CATEGORIES.find(c => c.value === marker.category)
                      const segDur   = marker.endTime - marker.startTime
                      const selected = selectedMarker === marker.id

                      return (
                        <div
                          key={marker.id}
                          className={`rounded-lg border p-4 transition-colors cursor-pointer ${
                            selected
                              ? "border-primary bg-primary/5"
                              : "border-border bg-background hover:bg-muted/50"
                          }`}
                          onClick={() => setSelectedMarker(marker.id)}
                        >
                          {/* Time row */}
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="space-y-1 min-w-0">
                              {/* Editable seconds inputs */}
                              <div
                                className="flex items-center gap-1 flex-wrap"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="text-xs text-muted-foreground">시작</span>
                                <input
                                  type="number"
                                  step="1"
                                  min="0"
                                  max={Math.floor(duration)}
                                  value={Math.round(marker.startTime)}
                                  onChange={(e) => handleMarkerTimeChange(marker.id, "startTime", e.target.value)}
                                  className="w-14 rounded border border-input bg-background px-1.5 py-0.5 text-xs font-mono text-center focus:outline-none focus:ring-1 focus:ring-ring"
                                />
                                <span className="text-xs text-muted-foreground">s</span>
                                <span className="text-xs text-muted-foreground mx-0.5">~</span>
                                <span className="text-xs text-muted-foreground">종료</span>
                                <input
                                  type="number"
                                  step="1"
                                  min="0"
                                  max={Math.floor(duration)}
                                  value={Math.round(marker.endTime)}
                                  onChange={(e) => handleMarkerTimeChange(marker.id, "endTime", e.target.value)}
                                  className="w-14 rounded border border-input bg-background px-1.5 py-0.5 text-xs font-mono text-center focus:outline-none focus:ring-1 focus:ring-ring"
                                />
                                <span className="text-xs text-muted-foreground">s</span>
                              </div>
                              {/* Human-readable + duration */}
                              <div className="text-xs text-muted-foreground font-mono">
                                {formatTime(marker.startTime)} – {formatTime(marker.endTime)}
                                <span className="ml-2 text-primary font-semibold">
                                  ({Math.round(segDur)}s)
                                </span>
                              </div>
                            </div>

                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 shrink-0"
                              onClick={(e) => { e.stopPropagation(); handleDeleteMarker(marker.id) }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>

                          {/* Prompt textarea */}
                          <div
                            className="space-y-1.5 mb-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Label className="text-xs">
                              AI 프롬프트 <span className="text-destructive">*</span>
                              <span className="ml-1 text-muted-foreground font-normal">(영어 · 최대 3단어)</span>
                            </Label>
                            <textarea
                              value={marker.prompt}
                              onChange={(e) => handleMarkerPromptChange(marker.id, e.target.value)}
                              placeholder="영어로 입력하세요 (최대 3단어)&#10;예: red laptop, silver can"
                              rows={2}
                              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                          </div>

                          {/* Category quick-fill */}
                          <div
                            className="space-y-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Label className="text-xs text-muted-foreground">
                              카테고리 선택 시 프롬프트 자동 입력
                            </Label>
                            <div className="flex gap-2">
                              <select
                                value={marker.category}
                                onChange={(e) => handleMarkerCategoryChange(marker.id, e.target.value)}
                                className="flex-1 h-8 rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              >
                                {AD_CATEGORIES.map((c) => (
                                  <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                              </select>
                              <Badge className={`${cat?.color ?? "bg-gray-500"} text-white shrink-0`}>
                                {cat?.label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleSubmit}
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={adMarkers.length === 0 || submitting}
                >
                  {submitting
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />처리 중...</>
                    : "광고 설정 완료"}
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
