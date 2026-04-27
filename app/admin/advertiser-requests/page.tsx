'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { apiClient } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react'

interface AdvertiserRequest {
  id: number
  userId: number
  userEmail: string
  userNickname: string
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  adminComment?: string
  createdAt: string
}

export default function AdminAdvertiserRequestsPage() {
  const { toast } = useToast()
  const [requests, setRequests] = useState<AdvertiserRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all')
  const [approveId, setApproveId] = useState<number | null>(null)
  const [rejectId, setRejectId] = useState<number | null>(null)
  const [rejectComment, setRejectComment] = useState('')

  useEffect(() => { loadRequests() }, [filter])

  const loadRequests = async () => {
    try {
      setLoading(true)
      let url = '/api/v1/admin/advertiser-requests?page=0&size=100'
      if (filter !== 'all') url += `&status=${filter}`
      const data = await apiClient.get<any>(url)
      setRequests(data.content || [])
    } catch {
      toast({ title: '오류', description: '신청 목록을 불러오는데 실패했습니다', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!approveId) return
    try {
      await apiClient.post(`/api/v1/admin/advertiser-requests/${approveId}/approve`)
      toast({ title: '승인 완료', description: '광고주 신청이 승인되었습니다' })
      setApproveId(null)
      loadRequests()
    } catch (e: any) {
      toast({ title: '오류', description: e.message, variant: 'destructive' })
    }
  }

  const handleReject = async () => {
    if (!rejectComment.trim()) {
      toast({ title: '입력 오류', description: '거부 사유를 입력해주세요', variant: 'destructive' })
      return
    }
    try {
      await apiClient.post(`/api/v1/admin/advertiser-requests/${rejectId}/reject`, { comment: rejectComment })
      toast({ title: '거부 완료', description: '광고주 신청이 거부되었습니다' })
      setRejectId(null)
      setRejectComment('')
      loadRequests()
    } catch (e: any) {
      toast({ title: '오류', description: e.message, variant: 'destructive' })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':  return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />대기 중</Badge>
      case 'APPROVED': return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />승인됨</Badge>
      case 'REJECTED': return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />거부됨</Badge>
      default:         return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">광고주 신청 관리</h1>
        <p className="text-muted-foreground">사용자의 광고주 권한 신청을 검토하고 승인/거부합니다</p>
      </div>

      {/* 필터 */}
      <div className="flex gap-2">
        {(['all', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((f) => (
          <Button key={f} variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)}>
            {f === 'all' ? '전체' : f === 'PENDING' ? '대기 중' : f === 'APPROVED' ? '승인됨' : '거부됨'}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
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
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>
                    <p className="font-medium">{req.userNickname}</p>
                    <p className="text-sm text-muted-foreground">{req.userEmail}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm line-clamp-2 max-w-md">{req.reason}</p>
                    {req.adminComment && (
                      <p className="text-xs text-muted-foreground mt-1">관리자 의견: {req.adminComment}</p>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(req.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(req.createdAt).toLocaleDateString('ko-KR')}
                  </TableCell>
                  <TableCell className="text-right">
                    {req.status === 'PENDING' && (
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => setApproveId(req.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" />승인
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => setRejectId(req.id)}>
                          <XCircle className="h-4 w-4 mr-1" />거부
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

      {/* 승인 다이얼로그 */}
      <AlertDialog open={approveId !== null} onOpenChange={() => setApproveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>광고주 신청을 승인하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>사용자에게 광고주 권한이 부여되어 광고 영상을 업로드할 수 있게 됩니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} className="bg-green-500 hover:bg-green-600">승인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 거부 다이얼로그 */}
      <AlertDialog open={rejectId !== null} onOpenChange={() => { setRejectId(null); setRejectComment('') }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>광고주 신청을 거부하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>거부 사유를 입력해주세요. 사용자에게 전달됩니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Textarea placeholder="거부 사유를 입력하세요..." rows={4} value={rejectComment} onChange={(e) => setRejectComment(e.target.value)} />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">거부</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
