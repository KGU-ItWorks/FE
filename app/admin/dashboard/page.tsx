'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BrowseHeader } from '@/components/browse-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { apiClient } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { 
  Video, 
  Users, 
  Eye, 
  HardDrive, 
  CheckCircle, 
  XCircle, 
  Clock,
  Trash2,
  Loader2
} from 'lucide-react'
import type { Video as VideoType } from '@/lib/api'

interface DashboardStats {
  totalVideos: number
  uploadingCount: number
  uploadedCount: number
  encodingCount: number
  completedCount: number
  failedCount: number
  pendingApprovalCount: number
  approvedCount: number
  rejectedCount: number
  totalViews: number
  totalStorageGB: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [videos, setVideos] = useState<VideoType[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [deleteVideoId, setDeleteVideoId] = useState<number | null>(null)
  const [approveVideoId, setApproveVideoId] = useState<number | null>(null)
  const [rejectVideoId, setRejectVideoId] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    checkAuth()
    loadDashboard()
  }, [])

  useEffect(() => {
    loadVideos()
  }, [page, filter])

  const checkAuth = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    }
  }

  const loadDashboard = async () => {
    try {
      const data = await apiClient.get<DashboardStats>('/api/v1/admin/videos/dashboard/stats')
      setStats(data)
    } catch (error) {
      console.error('Failed to load dashboard:', error)
      
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
          description: '대시보드 통계를 불러오는데 실패했습니다',
          variant: 'destructive',
        })
      }
    }
  }

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
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '영상 목록을 불러오는데 실패했습니다',
        variant: 'destructive',
      })
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

      loadDashboard()
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

      loadDashboard()
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

      loadDashboard()
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

  if (!stats) {
    return (
      <div className="min-h-screen bg-background">
        <BrowseHeader />
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <BrowseHeader />

      <div className="container mx-auto px-4 py-24 md:px-12">
        <h1 className="mb-8 text-4xl font-bold">관리자 대시보드</h1>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 영상</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVideos}</div>
              <p className="text-xs text-muted-foreground">
                완료: {stats.completedCount} | 실패: {stats.failedCount}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">승인 대기</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingApprovalCount}</div>
              <p className="text-xs text-muted-foreground">
                승인: {stats.approvedCount} | 거부: {stats.rejectedCount}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 조회수</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">저장 용량</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStorageGB.toFixed(2)} GB</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
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
            대기 중 ({stats.pendingApprovalCount})
          </Button>
          <Button
            variant={filter === 'approved' ? 'default' : 'outline'}
            onClick={() => setFilter('approved')}
          >
            승인됨 ({stats.approvedCount})
          </Button>
          <Button
            variant={filter === 'rejected' ? 'default' : 'outline'}
            onClick={() => setFilter('rejected')}
          >
            거부됨 ({stats.rejectedCount})
          </Button>
        </div>

        {/* Videos Table */}
        <Card>
          <CardHeader>
            <CardTitle>영상 목록</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>제목</TableHead>
                      <TableHead>업로더</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>승인 상태</TableHead>
                      <TableHead>조회수</TableHead>
                      <TableHead>작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {videos.map((video) => (
                      <TableRow key={video.id}>
                        <TableCell className="font-medium">{video.title}</TableCell>
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
                        <TableCell>
                          <div className="flex gap-2">
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4 flex justify-center gap-2">
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
          </CardContent>
        </Card>
      </div>

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
