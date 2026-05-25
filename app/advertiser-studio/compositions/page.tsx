'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { apiClient } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  CheckCircle, XCircle, PlayCircle, ChevronUp,
  RefreshCw, Loader2, Film, Megaphone, AlertCircle,
} from 'lucide-react'

// VideoPlayer uses video.js — load client-side only
const VideoPlayer = dynamic(() => import('@/components/VideoPlayer'), { ssr: false })

interface CompositionItem {
  id: number
  videoId: number
  adVideoId: number
  taskId: string | null
  hlsPath: string | null
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  requestedAt: string
  publishedAt: string | null
}

interface PageResponse {
  content: CompositionItem[]
  totalPages: number
  totalElements: number
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export default function CompositionsReviewPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<CompositionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  // which card has the inline player open
  const [expandedId, setExpandedId] = useState<number | null>(null)

  // reject dialog state
  const [rejectTarget, setRejectTarget] = useState<CompositionItem | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // ── data fetching ────────────────────────────────────────────────────────────

  const loadCompositions = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      else setRefreshing(true)
      const data = await apiClient.get<PageResponse>(
        `/api/v1/video-compositions/pending?page=${page}&size=10`
      )
      setItems(data.content ?? [])
      setTotalPages(data.totalPages ?? 0)
      setTotalElements(data.totalElements ?? 0)
    } catch (e: any) {
      toast({ title: '불러오기 실패', description: e.message, variant: 'destructive' })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [page])

  useEffect(() => { loadCompositions() }, [loadCompositions])

  // ── approve ──────────────────────────────────────────────────────────────────

  const handleApprove = async (item: CompositionItem) => {
    try {
      setSubmitting(true)
      await apiClient.post(`/api/v1/video-compositions/${item.id}/approve`)
      toast({ title: '승인 완료 ✅', description: '합성 영상이 시청자에게 공개됩니다.' })
      setExpandedId(null)
      loadCompositions(true)
    } catch (e: any) {
      toast({ title: '승인 실패', description: e.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  // ── reject ───────────────────────────────────────────────────────────────────

  const openRejectDialog = (item: CompositionItem) => {
    setRejectTarget(item)
    setRejectReason('')
  }

  const handleReject = async () => {
    if (!rejectTarget) return
    try {
      setSubmitting(true)
      await apiClient.post(`/api/v1/video-compositions/${rejectTarget.id}/reject`, {
        reason: rejectReason.trim() || '거절 사유 없음',
      })
      toast({ title: '거절 완료', description: '합성 영상이 거절되었습니다.' })
      setRejectTarget(null)
      setExpandedId(null)
      loadCompositions(true)
    } catch (e: any) {
      toast({ title: '거절 실패', description: e.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  // ── helpers ──────────────────────────────────────────────────────────────────

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ko-KR', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

  const togglePreview = (id: number) =>
    setExpandedId(prev => (prev === id ? null : id))

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">합성 영상 검토</h1>
          <p className="text-muted-foreground mt-1">
            내 광고 영상이 삽입된 합성 결과를 미리 보고 승인 또는 거절합니다
          </p>
        </div>
        <Button
          variant="ghost" size="sm"
          onClick={() => loadCompositions(true)}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      {/* 안내 배너 */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-sm">
        <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="text-muted-foreground">
          <span className="font-semibold text-yellow-600">승인하면 즉시 공개됩니다.</span>{' '}
          미리보기로 합성 결과를 확인한 뒤 승인 또는 거절을 선택하세요.
          거절된 영상은 시청자에게 노출되지 않습니다.
        </div>
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl">
          <Film className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">검토 대기 중인 합성 영상이 없습니다</h3>
          <p className="text-sm text-muted-foreground">
            내 광고 영상이 합성에 사용되면 여기에 표시됩니다
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            총 <strong>{totalElements}</strong>건 검토 대기
          </p>

          {items.map(item => (
            <div
              key={item.id}
              className="bg-card border border-border rounded-xl overflow-hidden
                         hover:border-yellow-500/40 transition"
            >
              {/* 카드 헤더 */}
              <div className="flex items-center gap-4 p-5">

                {/* 아이콘 */}
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center
                                rounded-lg bg-yellow-500/10">
                  <Megaphone className="h-5 w-5 text-yellow-500" />
                </div>

                {/* 메타 */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs font-mono">
                      광고 #{item.adVideoId}
                    </Badge>
                    <Badge variant="secondary" className="text-xs font-mono">
                      영상 #{item.videoId}
                    </Badge>
                    <Badge variant="secondary" className="text-xs gap-1 bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                      검토 대기
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    합성 요청: {formatDate(item.requestedAt)}
                  </p>
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.hlsPath && (
                    <Button
                      size="sm" variant="outline"
                      className="gap-1.5 text-xs"
                      onClick={() => togglePreview(item.id)}
                    >
                      {expandedId === item.id
                        ? <><ChevronUp className="h-3.5 w-3.5" />숨기기</>
                        : <><PlayCircle className="h-3.5 w-3.5" />미리보기</>
                      }
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="gap-1.5 bg-green-600 hover:bg-green-500 text-white text-xs"
                    onClick={() => handleApprove(item)}
                    disabled={submitting}
                  >
                    <CheckCircle className="h-3.5 w-3.5" />승인
                  </Button>
                  <Button
                    size="sm" variant="outline"
                    className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 text-xs"
                    onClick={() => openRejectDialog(item)}
                    disabled={submitting}
                  >
                    <XCircle className="h-3.5 w-3.5" />거절
                  </Button>
                </div>
              </div>

              {/* 인라인 플레이어 */}
              {expandedId === item.id && item.hlsPath && (
                <div className="border-t border-border bg-black px-5 pb-5 pt-4">
                  <p className="text-xs text-muted-foreground mb-3">
                    합성된 영상 미리보기 — 광고 삽입 결과를 확인하세요
                  </p>
                  <div className="rounded-lg overflow-hidden max-w-2xl">
                    <VideoPlayer src={`${BASE_URL}${item.hlsPath}`} />
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <Button
                      className="gap-1.5 bg-green-600 hover:bg-green-500 text-white"
                      onClick={() => handleApprove(item)}
                      disabled={submitting}
                    >
                      <CheckCircle className="h-4 w-4" />이 영상 승인
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10"
                      onClick={() => openRejectDialog(item)}
                      disabled={submitting}
                    >
                      <XCircle className="h-4 w-4" />거절하기
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-2">
              <Button
                variant="outline" size="sm"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >
                이전
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline" size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
              >
                다음
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 거절 다이얼로그 */}
      <Dialog
        open={rejectTarget !== null}
        onOpenChange={open => { if (!open) setRejectTarget(null) }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>합성 영상 거절</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              광고 #{rejectTarget?.adVideoId} · 영상 #{rejectTarget?.videoId} 합성 결과를
              거절합니다. 거절 사유를 입력하면 기록됩니다.
            </p>
            <Textarea
              placeholder="거절 사유 (선택)"
              rows={3}
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectTarget(null)}
              disabled={submitting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={submitting}
            >
              {submitting
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <><XCircle className="h-4 w-4 mr-1" />거절 확정</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
