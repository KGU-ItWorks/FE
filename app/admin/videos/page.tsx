'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { 
  CheckCircle, 
  XCircle, 
  Trash2,
  Loader2,
  Search,
  Filter,
  Eye
} from 'lucide-react'
import type { Video } from '@/lib/api'
import Link from 'next/link'

export default function AdminVideosPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  const [deleteVideoId, setDeleteVideoId] = useState<number | null>(null)
  const [approveVideoId, setApproveVideoId] = useState<number | null>(null)
  const [rejectVideoId, setRejectVideoId] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    loadVideos()
  }, [page, filter])

  const loadVideos = async () => {
    try {
      setLoading(true)
      
      let url = `/api/v1/admin/videos?page=${page}&size=20`
      if (filter !== 'all') {
        url += `&approvalStatus=${filter.toUpperCase()}`
      }

      const data = await apiClient.get<any>(url)
      setVideos(data.content)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Failed to load videos:', error)
      
      if (error instanceof Error && error.message.includes('인증')) {
        toast({
          title: '권한 없음',
          description: '관리자 권한이 필요합니다',
          variant: 'destructive',
        })
        router.push('/browse')
      } else {
        toast({
          title: '오류',
          description: error instanceof Error ? error.message : '영상 목록을 불러오는데 실패했습니다',
          variant: 'destructive',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!approveVideoId) return

    try {
      await apiClient.post(`/api/v1/admin/videos/${approveVideoId}/approve`)

      toast({
        title: '성공',
        description: '영상이 승인되었습니다',
      })

      loadVideos()
    } catch (error) {
      console.error('Failed to approve video:', error)
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '영상 승인 중 오류가 발생했습니다',
        variant: 'destructive',
      })
    } finally {
      setApproveVideoId(null)
    }
  }

  const handleReject = async () => {
    if (!rejectVideoId || !rejectReason.trim()) {
      toast({
        title: '입력 오류',
        description: '거부 사유를 입력해주세요',
        variant: 'destructive',
      })
      return
    }

    try {
      await apiClient.post(`/api/v1/admin/videos/${rejectVideoId}/reject?reason=${encodeURIComponent(rejectReason)}`)

      toast({
        title: '성공',
        description: '영상이 거부되었습니다',
      })

      loadVideos()
    } catch (error) {
      console.error('Failed to reject video:', error)
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '영상 거부 중 오류가 발생했습니다',
        variant: 'destructive',
      })
    } finally {
      setRejectVideoId(null)
      setRejectReason('')
    }
  }

  const handleDelete = async () => {
    if (!deleteVideoId) return

    try {
      await apiClient.delete(`/api/v1/admin/videos/${deleteVideoId}`)

      toast({
        title: '성공',
        description: '영상이 삭제되었습니다',
      })

      loadVideos()
    } catch (error) {
      console.error('Failed to delete video:', error)
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '영상 삭제 중 오류가 발생했습니다',
        variant: 'destructive',
      })
    } finally {
      setDeleteVideoId(null)
    }
  }

  const filteredVideos = videos.filter(video =>
    searchQuery === '' ||
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.uploaderName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">영상 관리</h1>
        <p className="text-muted-foreground">모든 영상을 관리하고 승인/거부할 수 있습니다</p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            전체
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
          >
            <Filter className="h-4 w-4 mr-2" />
            대기 중
          </Button>
          <Button
            variant={filter === 'approved' ? 'default' : 'outline'}
            onClick={() => setFilter('approved')}
          >
            승인됨
          </Button>
          <Button
            variant={filter === 'rejected' ? 'default' : 'outline'}
            onClick={() => setFilter('rejected')}
          >
            거부됨
          </Button>
        </div>

        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="영상 제목 또는 업로더 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Videos Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>제목</TableHead>
                  <TableHead>업로더</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>승인 상태</TableHead>
                  <TableHead>조회수</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVideos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell className="font-medium">
                      <Link href={`/watch/${video.id}`} className="hover:underline">
                        {video.title}
                      </Link>
                    </TableCell>
                    <TableCell>{video.uploaderName || '알 수 없음'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{video.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {video.approvalStatus === 'PENDING' && (
                        <Badge variant="secondary">대기 중</Badge>
                      )}
                      {video.approvalStatus === 'APPROVED' && (
                        <Badge className="bg-green-500">승인됨</Badge>
                      )}
                      {video.approvalStatus === 'REJECTED' && (
                        <Badge variant="destructive">거부됨</Badge>
                      )}
                    </TableCell>
                    <TableCell>{video.viewCount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/watch/${video.id}`}>
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {video.approvalStatus === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-green-500 hover:bg-green-600"
                              onClick={() => setApproveVideoId(video.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setRejectVideoId(video.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteVideoId(video.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                variant="outline"
              >
                이전
              </Button>
              <div className="flex items-center px-4">
                <span className="text-sm text-muted-foreground">
                  {page + 1} / {totalPages}
                </span>
              </div>
              <Button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
                variant="outline"
              >
                다음
              </Button>
            </div>
          )}
        </>
      )}

      {/* Approve Dialog */}
      <AlertDialog open={approveVideoId !== null} onOpenChange={() => setApproveVideoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>영상을 승인하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              승인된 영상은 사용자에게 공개됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove}>승인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={rejectVideoId !== null} onOpenChange={() => {
        setRejectVideoId(null)
        setRejectReason('')
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>영상을 거부하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              거부 사유를 입력해주세요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={4}
              placeholder="거부 사유를 입력하세요..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              거부
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteVideoId !== null} onOpenChange={() => setDeleteVideoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>영상을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 취소할 수 없습니다. 영상이 영구적으로 삭제됩니다.
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
