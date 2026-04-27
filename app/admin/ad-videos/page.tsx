'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { apiClient } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Trash2, CheckCircle, XCircle, Clock, ImageIcon } from 'lucide-react'

interface AdVideo {
  id: number
  title: string
  originalFilename: string
  originalFileSize: number
  status: 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED'
  failReason?: string
  nukiDirPath?: string
  advertiserId: number
  advertiserNickname: string
  createdAt: string
}

interface Stats {
  totalAdVideos: number
  pendingCount: number
  processingCount: number
  doneCount: number
  failedCount: number
}

export default function AdminAdVideosPage() {
  const { toast } = useToast()
  const [adVideos, setAdVideos] = useState<AdVideo[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED'>('all')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)

  useEffect(() => { loadStats() }, [])
  useEffect(() => { loadAdVideos() }, [filter, page])

  const loadStats = async () => {
    try {
      const data = await apiClient.get<Stats>('/api/v1/admin/ad-videos/stats')
      setStats(data)
    } catch { /* 통계 실패는 무시 */ }
  }

  const loadAdVideos = async () => {
    try {
      setLoading(true)
      let url = `/api/v1/admin/ad-videos?page=${page}&size=20`
      if (filter !== 'all') url += `&status=${filter}`
      const data = await apiClient.get<any>(url)
      setAdVideos(data.content || [])
      setTotalPages(data.totalPages || 0)
    } catch {
      toast({ title: '오류', description: '광고 영상 목록을 불러오는데 실패했습니다', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTargetId) return
    try {
      await apiClient.delete(`/api/v1/admin/ad-videos/${deleteTargetId}`)
      toast({ title: '삭제 완료', description: '광고 영상이 삭제되었습니다' })
      setDeleteTargetId(null)
      loadAdVideos()
      loadStats()
    } catch (e: any) {
      toast({ title: '삭제 실패', description: e.message, variant: 'destructive' })
    }
  }

  const getStatusBadge = (status: AdVideo['status']) => {
    switch (status) {
      case 'PENDING':    return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />대기</Badge>
      case 'PROCESSING': return <Badge variant="default"><Loader2 className="h-3 w-3 mr-1 animate-spin" />처리 중</Badge>
      case 'DONE':       return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />완료</Badge>
      case 'FAILED':     return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />실패</Badge>
    }
  }

  const formatFileSize = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">광고 영상 관리</h1>
        <p className="text-muted-foreground">모든 광고주의 광고 영상과 누끼 처리 현황을 관리합니다</p>
      </div>

      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: '전체', value: stats.totalAdVideos, color: 'text-foreground' },
            { label: '대기', value: stats.pendingCount, color: 'text-muted-foreground' },
            { label: '처리 중', value: stats.processingCount, color: 'text-blue-500' },
            { label: '완료', value: stats.doneCount, color: 'text-green-500' },
            { label: '실패', value: stats.failedCount, color: 'text-destructive' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-card border border-border rounded-lg p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* 필터 */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'PENDING', 'PROCESSING', 'DONE', 'FAILED'] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? 'default' : 'outline'}
            onClick={() => { setFilter(f); setPage(0) }}
          >
            {f === 'all' ? '전체' : f === 'PENDING' ? '대기' : f === 'PROCESSING' ? '처리 중' : f === 'DONE' ? '완료' : '실패'}
          </Button>
        ))}
      </div>

      {/* 테이블 */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : adVideos.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-lg">
          <p className="text-muted-foreground">광고 영상이 없습니다</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>제목</TableHead>
                <TableHead>광고주</TableHead>
                <TableHead>파일 크기</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>누끼 결과</TableHead>
                <TableHead>업로드일</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adVideos.map((adVideo) => (
                <TableRow key={adVideo.id}>
                  <TableCell>
                    <p className="font-medium">{adVideo.title}</p>
                    <p className="text-xs text-muted-foreground">{adVideo.originalFilename}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{adVideo.advertiserNickname}</p>
                    <p className="text-xs text-muted-foreground">ID: {adVideo.advertiserId}</p>
                  </TableCell>
                  <TableCell className="text-sm">{formatFileSize(adVideo.originalFileSize)}</TableCell>
                  <TableCell>
                    {getStatusBadge(adVideo.status)}
                    {adVideo.status === 'FAILED' && adVideo.failReason && (
                      <p className="text-xs text-destructive mt-1 max-w-[160px] truncate" title={adVideo.failReason}>
                        {adVideo.failReason}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    {adVideo.status === 'DONE' ? (
                      <div className="flex items-center gap-1 text-green-500 text-sm">
                        <ImageIcon className="h-4 w-4" />
                        <span className="text-xs text-muted-foreground truncate max-w-[120px]" title={adVideo.nukiDirPath}>
                          저장됨
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(adVideo.createdAt).toLocaleDateString('ko-KR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="destructive" onClick={() => setDeleteTargetId(adVideo.id)}>
                      <Trash2 className="h-4 w-4 mr-1" />삭제
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>이전</Button>
          <div className="flex items-center px-4 text-sm text-muted-foreground">{page + 1} / {totalPages}</div>
          <Button variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>다음</Button>
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteTargetId !== null} onOpenChange={() => setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>광고 영상을 강제 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              영상 파일과 누끼 이미지가 모두 영구 삭제됩니다. 이 작업은 취소할 수 없습니다.
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
