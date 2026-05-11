'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Video, Upload, Trash2, CheckCircle, XCircle, Clock, Loader2, ImageIcon, Eye, RefreshCw } from 'lucide-react'

interface AdVideo {
  id: number
  title: string
  description?: string
  originalFilename: string
  originalFileSize: number
  status: 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED'
  failReason?: string
  nukiDirPath?: string
  objectCategory?: string
  createdAt: string
}

const CATEGORY_LABELS: Record<string, string> = {
  FASHION: '패션',
  FOOD: '식품/음료',
  ELECTRONICS: '전자기기',
  BEAUTY: '뷰티',
  FURNITURE: '가구',
  SPORTS: '스포츠',
  CAR: '자동차',
  PET: '반려동물',
  BOOK: '도서',
  TOY: '장난감',
}

export default function AdvertiserVideosPage() {
  const { toast } = useToast()
  const [adVideos, setAdVideos] = useState<AdVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)

  const loadAdVideos = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      else setRefreshing(true)
      const data = await apiClient.get<any>(`/api/v1/advertiser/videos?page=${page}&size=20`)
      setAdVideos(data.content || [])
      setTotalPages(data.totalPages || 0)
    } catch {
      toast({ title: '불러오기 실패', description: '광고 영상 목록을 불러오지 못했습니다', variant: 'destructive' })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [page])

  useEffect(() => { loadAdVideos() }, [loadAdVideos])

  // PENDING/PROCESSING 항목이 있으면 30초마다 자동 갱신
  useEffect(() => {
    const hasPending = adVideos.some(v => v.status === 'PENDING' || v.status === 'PROCESSING')
    if (!hasPending) return
    const timer = setInterval(() => loadAdVideos(true), 30_000)
    return () => clearInterval(timer)
  }, [adVideos, loadAdVideos])

  const handleDelete = async () => {
    if (!deleteTargetId) return
    try {
      await apiClient.delete(`/api/v1/advertiser/videos/${deleteTargetId}`)
      toast({ title: '삭제 완료', description: '광고 영상이 삭제되었습니다' })
      loadAdVideos()
    } catch (e: any) {
      toast({ title: '삭제 실패', description: e.message, variant: 'destructive' })
    } finally {
      setDeleteTargetId(null)
    }
  }

  const getStatusBadge = (status: AdVideo['status']) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />처리 대기</Badge>
      case 'PROCESSING':
        return <Badge className="gap-1 bg-blue-500 hover:bg-blue-500"><Loader2 className="h-3 w-3 animate-spin" />AI 분석 중</Badge>
      case 'DONE':
        return <Badge className="gap-1 bg-green-500 hover:bg-green-500"><CheckCircle className="h-3 w-3" />완료</Badge>
      case 'FAILED':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />실패</Badge>
    }
  }

  const formatFileSize = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })

  const processingCount = adVideos.filter(v => v.status === 'PENDING' || v.status === 'PROCESSING').length

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">광고 영상 관리</h1>
          <p className="text-muted-foreground mt-1">업로드한 광고 영상과 누끼 처리 결과를 관리합니다</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => loadAdVideos(true)} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />새로고침
          </Button>
          <Link href="/advertiser-studio/upload">
            <Button className="bg-yellow-500 text-black hover:bg-yellow-400">
              <Upload className="h-4 w-4 mr-2" />영상 업로드
            </Button>
          </Link>
        </div>
      </div>

      {/* 처리 중 알림 배너 */}
      {processingCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
          <span>
            <strong>{processingCount}개</strong>의 영상이 AI 누끼 처리 중입니다.
            완료되면 자동으로 업데이트됩니다. (30분~1시간 소요)
          </span>
        </div>
      )}

      {/* 목록 */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
        </div>
      ) : adVideos.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">업로드한 광고 영상이 없습니다</h3>
          <p className="text-sm text-muted-foreground mb-4">영상을 업로드하면 AI가 자동으로 누끼 이미지를 추출합니다</p>
          <Link href="/advertiser-studio/upload">
            <Button className="bg-yellow-500 text-black hover:bg-yellow-400">첫 영상 업로드하기</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {adVideos.map((adVideo) => (
            <div
              key={adVideo.id}
              className="bg-card border border-border rounded-xl p-5 hover:border-yellow-500/40 transition"
            >
              <div className="flex items-start gap-4">
                {/* 썸네일 영역 */}
                <div className="flex h-20 w-32 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Video className="h-7 w-7 text-muted-foreground" />
                </div>

                {/* 콘텐츠 */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* 제목 + 삭제 */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base truncate">{adVideo.title}</h3>
                      {adVideo.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{adVideo.description}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive flex-shrink-0"
                      onClick={() => setDeleteTargetId(adVideo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* 배지 행 */}
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(adVideo.status)}
                    {adVideo.objectCategory && (
                      <Badge variant="outline" className="text-xs">
                        {CATEGORY_LABELS[adVideo.objectCategory] ?? adVideo.objectCategory}
                      </Badge>
                    )}
                  </div>

                  {/* 메타 정보 */}
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>{adVideo.originalFilename}</span>
                    <span>·</span>
                    <span>{formatFileSize(adVideo.originalFileSize)}</span>
                    <span>·</span>
                    <span>{formatDate(adVideo.createdAt)}</span>
                  </div>

                  {/* 상태별 추가 영역 */}
                  {adVideo.status === 'PROCESSING' && (
                    <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-500/10 rounded-lg px-3 py-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      AI가 객체를 탐지하고 누끼를 추출하고 있습니다…
                    </div>
                  )}

                  {adVideo.status === 'PENDING' && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 rounded-lg px-3 py-2">
                      <Clock className="h-3 w-3" />
                      잠시 후 처리가 시작됩니다
                    </div>
                  )}

                  {adVideo.status === 'FAILED' && adVideo.failReason && (
                    <div className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                      실패 사유: {adVideo.failReason}
                    </div>
                  )}

                  {adVideo.status === 'DONE' && (
                    <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                        <ImageIcon className="h-3.5 w-3.5" />
                        누끼 이미지 준비 완료
                      </div>
                      <Link href={`/advertiser-studio/videos/${adVideo.id}/nuki`}>
                        <Button size="sm" variant="outline" className="h-7 text-xs border-green-500/40 text-green-600 hover:bg-green-500/10">
                          <Eye className="h-3 w-3 mr-1" />누끼 보기
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <Button variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>이전</Button>
              <div className="flex items-center px-4 text-sm text-muted-foreground">{page + 1} / {totalPages}</div>
              <Button variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>다음</Button>
            </div>
          )}
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteTargetId !== null} onOpenChange={() => setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>광고 영상을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              영상 파일과 추출된 누끼 이미지가 모두 영구 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
