'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Video, Upload, Trash2, CheckCircle, XCircle, Clock, Loader2, ImageIcon } from 'lucide-react'

interface AdVideo {
  id: number
  title: string
  description?: string
  originalFilename: string
  originalFileSize: number
  status: 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED'
  failReason?: string
  nukiDirPath?: string
  createdAt: string
}

export default function AdvertiserVideosPage() {
  const { toast } = useToast()
  const [adVideos, setAdVideos] = useState<AdVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)

  useEffect(() => { loadAdVideos() }, [page])

  const loadAdVideos = async () => {
    try {
      setLoading(true)
      const data = await apiClient.get<any>(`/api/v1/advertiser/videos?page=${page}&size=20`)
      setAdVideos(data.content || [])
      setTotalPages(data.totalPages || 0)
    } catch {
      toast({ title: '불러오기 실패', description: '광고 영상 목록을 불러오지 못했습니다', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

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
      case 'PENDING':    return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />처리 대기</Badge>
      case 'PROCESSING': return <Badge variant="default"><Loader2 className="h-3 w-3 mr-1 animate-spin" />처리 중</Badge>
      case 'DONE':       return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />완료</Badge>
      case 'FAILED':     return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />실패</Badge>
    }
  }

  const formatFileSize = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">광고 영상 관리</h1>
          <p className="text-muted-foreground mt-1">업로드한 광고 영상과 누끼 처리 결과를 관리합니다</p>
        </div>
        <Link href="/advertiser-studio/upload">
          <Button className="bg-yellow-500 text-black hover:bg-yellow-400">
            <Upload className="h-4 w-4 mr-2" />영상 업로드
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
        </div>
      ) : adVideos.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">업로드한 광고 영상이 없습니다</h3>
          <Link href="/advertiser-studio/upload">
            <Button className="mt-4 bg-yellow-500 text-black hover:bg-yellow-400">영상 업로드하기</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {adVideos.map((adVideo) => (
            <div key={adVideo.id} className="bg-card border border-border rounded-xl p-5 hover:border-yellow-500/50 transition">
              <div className="flex items-start gap-5">
                <div className="flex h-24 w-40 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Video className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{adVideo.title}</h3>
                      {adVideo.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">{adVideo.description}</p>
                      )}
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => setDeleteTargetId(adVideo.id)}>
                      <Trash2 className="h-4 w-4 mr-1" />삭제
                    </Button>
                  </div>
                  <div>{getStatusBadge(adVideo.status)}</div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>{adVideo.originalFilename}</span>
                    <span>{formatFileSize(adVideo.originalFileSize)}</span>
                    <span>{new Date(adVideo.createdAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                  {adVideo.status === 'FAILED' && adVideo.failReason && (
                    <p className="text-sm text-destructive">실패 사유: {adVideo.failReason}</p>
                  )}
                  {adVideo.status === 'DONE' && (
                    <div className="mt-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-green-500">누끼 이미지 처리 완료</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{adVideo.nukiDirPath}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <Button variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>이전</Button>
              <div className="flex items-center px-4 text-sm text-muted-foreground">{page + 1} / {totalPages}</div>
              <Button variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>다음</Button>
            </div>
          )}
        </div>
      )}

      <AlertDialog open={deleteTargetId !== null} onOpenChange={() => setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>광고 영상을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>영상 파일과 누끼 이미지가 모두 영구 삭제됩니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
