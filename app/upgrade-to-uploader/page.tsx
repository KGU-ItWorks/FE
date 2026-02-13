'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BrowseHeader } from '@/components/browse-header'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { CheckCircle, XCircle, Clock, Upload, ArrowLeft } from 'lucide-react'

interface UploaderRequest {
  id: number
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  adminComment?: string
  createdAt: string
  updatedAt: string
}

export default function UpgradeToUploaderPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, refreshUser } = useAuth()
  
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [myRequests, setMyRequests] = useState<UploaderRequest[]>([])
  const [hasActivePendingRequest, setHasActivePendingRequest] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    // 이미 업로더 이상이면 리다이렉트
    if (user.role === 'ROLE_UPLOADER' || user.role === 'ROLE_ADMIN') {
      toast({
        title: '안내',
        description: '이미 업로더 권한을 가지고 있습니다',
      })
      router.push('/browse')
      return
    }

    loadMyRequests()
  }, [user])

  const loadMyRequests = async () => {
    try {
      const data = await apiClient.get<any>('/api/v1/uploader-requests/my?page=0&size=10')
      setMyRequests(data.content || [])
      
      // 대기 중인 신청이 있는지 확인
      const hasPending = data.content?.some((r: UploaderRequest) => r.status === 'PENDING')
      setHasActivePendingRequest(hasPending)
    } catch (error) {
      console.error('Failed to load requests:', error)
    }
  }

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast({
        title: '입력 오류',
        description: '승급 신청 이유를 입력해주세요',
        variant: 'destructive',
      })
      return
    }

    if (reason.trim().length < 50) {
      toast({
        title: '입력 오류',
        description: '승급 신청 이유를 50자 이상 작성해주세요',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)
      await apiClient.post('/api/v1/uploader-requests', { reason })
      
      toast({
        title: '신청 완료',
        description: '업로더 승급 신청이 제출되었습니다. 관리자 검토를 기다려주세요.',
      })
      
      setReason('')
      loadMyRequests()
    } catch (error: any) {
      toast({
        title: '오류',
        description: error.message || '신청 중 오류가 발생했습니다',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
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

  if (!user || user.role !== 'ROLE_USER') {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <BrowseHeader />

      <div className="container mx-auto px-4 md:px-12 py-24">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            뒤로 가기
          </button>
          
          <h1 className="text-4xl font-bold mb-2">업로더 승급 신청</h1>
          <p className="text-muted-foreground">
            영상을 업로드하려면 업로더 권한이 필요합니다. 관리자에게 승급을 신청하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 신청 폼 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  새로운 승급 신청
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasActivePendingRequest ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">대기 중인 신청이 있습니다</h3>
                    <p className="text-muted-foreground">
                      현재 신청이 검토 중입니다. 결과를 기다려주세요.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        승급 신청 이유 <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        placeholder="업로더가 되고 싶은 이유를 작성해주세요 (최소 50자)"
                        rows={8}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        {reason.length} / 50자 이상
                      </p>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">📝 작성 가이드</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• 업로드하고 싶은 콘텐츠의 종류</li>
                        <li>• 영상 제작 경험 또는 계획</li>
                        <li>• Streamly에서 활동하고자 하는 목표</li>
                      </ul>
                    </div>

                    <Button
                      onClick={handleSubmit}
                      disabled={loading || reason.trim().length < 50}
                      className="w-full"
                    >
                      {loading ? '제출 중...' : '승급 신청하기'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 안내 */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>승급 절차 안내</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">1️⃣ 신청서 제출</h4>
                  <p className="text-sm text-muted-foreground">
                    업로더가 되고 싶은 이유를 작성하여 신청서를 제출합니다.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">2️⃣ 관리자 검토</h4>
                  <p className="text-sm text-muted-foreground">
                    관리자가 신청 내용을 검토합니다. (보통 1-3일 소요)
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">3️⃣ 승인 결과</h4>
                  <p className="text-sm text-muted-foreground">
                    승인되면 업로더 권한이 부여되고, 영상을 업로드할 수 있습니다.
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">💡 TIP</h4>
                  <p className="text-sm text-muted-foreground">
                    구체적이고 진정성 있는 신청 이유가 승인 확률을 높입니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 신청 내역 */}
        {myRequests.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">내 신청 내역</h2>
            <div className="space-y-4">
              {myRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(request.status)}
                          <span className="text-sm text-muted-foreground">
                            {formatDate(request.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{request.reason}</p>
                      </div>
                    </div>
                    
                    {request.adminComment && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <p className="text-sm font-semibold mb-1">관리자 의견:</p>
                        <p className="text-sm text-muted-foreground">{request.adminComment}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
