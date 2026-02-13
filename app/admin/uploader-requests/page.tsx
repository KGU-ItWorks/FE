'use client'

import { useState, useEffect } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { apiClient } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react'

interface UploaderRequest {
  id: number
  userId: number
  userEmail: string
  userNickname: string
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  adminComment?: string
  createdAt: string
}

export default function AdminUploaderRequestsPage() {
  const { toast } = useToast()
  const [requests, setRequests] = useState<UploaderRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all')
  const [approveRequestId, setApproveRequestId] = useState<number | null>(null)
  const [rejectRequestId, setRejectRequestId] = useState<number | null>(null)
  const [rejectComment, setRejectComment] = useState('')

  useEffect(() => {
    loadRequests()
  }, [filter])

  const loadRequests = async () => {
    try {
      setLoading(true)
      let url = '/api/v1/admin/uploader-requests?page=0&size=100'
      if (filter !== 'all') {
        url += `&status=${filter}`
      }

      const data = await apiClient.get<any>(url)
      setRequests(data.content || [])
    } catch (error) {
      console.error('Failed to load requests:', error)
      toast({
        title: '오류',
        description: '신청 목록을 불러오는데 실패했습니다',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!approveRequestId) return

    try {
      await apiClient.post(`/api/v1/admin/uploader-requests/${approveRequestId}/approve`)
      
      toast({
        title: '승인 완료',
        description: '업로더 승급 신청이 승인되었습니다',
      })
      
      setApproveRequestId(null)
      loadRequests()
    } catch (error: any) {
      toast({
        title: '오류',
        description: error.message || '승인 처리 중 오류가 발생했습니다',
        variant: 'destructive',
      })
    }
  }

  const handleReject = async () => {
    if (!rejectRequestId || !rejectComment.trim()) {
      toast({
        title: '입력 오류',
        description: '거부 사유를 입력해주세요',
        variant: 'destructive',
      })
      return
    }

    try {
      await apiClient.post(
        `/api/v1/admin/uploader-requests/${rejectRequestId}/reject`,
        { comment: rejectComment }
      )
      
      toast({
        title: '거부 완료',
        description: '업로더 승급 신청이 거부되었습니다',
      })
      
      setRejectRequestId(null)
      setRejectComment('')
      loadRequests()
    } catch (error: any) {
      toast({
        title: '오류',
        description: error.message || '거부 처리 중 오류가 발생했습니다',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />대기 중</Badge>
      case 'APPROVED':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />승인됨</Badge>
      case 'REJECTED':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />거부됨</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">업로더 승급 신청 관리</h1>
        <p className="text-muted-foreground">사용자의 업로더 권한 신청을 검토하고 승인/거부합니다</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          전체
        </Button>
        <Button
          variant={filter === 'PENDING' ? 'default' : 'outline'}
          onClick={() => setFilter('PENDING')}
        >
          대기 중
        </Button>
        <Button
          variant={filter === 'APPROVED' ? 'default' : 'outline'}
          onClick={() => setFilter('APPROVED')}
        >
          승인됨
        </Button>
        <Button
          variant={filter === 'REJECTED' ? 'default' : 'outline'}
          onClick={() => setFilter('REJECTED')}
        >
          거부됨
        </Button>
      </div>

      {/* Requests Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-lg">
          <p className="text-muted-foreground">신청 내역이 없습니다</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>사용자</TableHead>
                <TableHead>신청 이유</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>신청일</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{request.userNickname || request.userEmail}</p>
                      <p className="text-sm text-muted-foreground">{request.userEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-md">
                      <p className="text-sm line-clamp-2">{request.reason}</p>
                      {request.adminComment && (
                        <p className="text-xs text-muted-foreground mt-2">
                          관리자 의견: {request.adminComment}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>{formatDate(request.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    {request.status === 'PENDING' && (
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => setApproveRequestId(request.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          승인
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setRejectRequestId(request.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          거부
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Approve Dialog */}
      <AlertDialog open={approveRequestId !== null} onOpenChange={() => setApproveRequestId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>업로더 승급을 승인하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              사용자에게 업로더 권한이 부여되며, 영상을 업로드할 수 있게 됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} className="bg-green-500 hover:bg-green-600">
              승인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={rejectRequestId !== null} onOpenChange={() => {
        setRejectRequestId(null)
        setRejectComment('')
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>업로더 승급을 거부하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              거부 사유를 입력해주세요. 사용자에게 전달됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Textarea
              placeholder="거부 사유를 입력하세요..."
              rows={4}
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
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
    </div>
  )
}
