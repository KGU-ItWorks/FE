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
import { CheckCircle, XCircle, Clock, Megaphone, ArrowLeft, Loader2 } from 'lucide-react'

interface AdvertiserRequest {
  id: number
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  adminComment?: string
  createdAt: string
}

export default function UpgradeToAdvertiserPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useAuth()

  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [myRequests, setMyRequests] = useState<AdvertiserRequest[]>([])
  const [hasPending, setHasPending] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }
    if (user.role === 'ROLE_ADVERTISER' || user.role === 'ROLE_ADMIN') {
      toast({ title: '안내', description: '이미 광고주 권한을 가지고 있습니다' })
      router.push('/advertiser-studio')
      return
    }
    loadMyRequests()
  }, [user, authLoading])

  const loadMyRequests = async () => {
    try {
      const data = await apiClient.get<any>('/api/v1/advertiser-requests/my?page=0&size=10')
      setMyRequests(data.content || [])
      setHasPending(data.content?.some((r: AdvertiserRequest) => r.status === 'PENDING'))
    } catch (e) {
      console.error(e)
    }
  }

  const handleSubmit = async () => {
    if (reason.trim().length < 50) {
      toast({ title: '입력 오류', description: '신청 이유를 50자 이상 작성해주세요', variant: 'destructive' })
      return
    }
    try {
      setLoading(true)
      await apiClient.post('/api/v1/advertiser-requests', { reason })
      toast({ title: '신청 완료', description: '광고주 신청이 제출되었습니다. 관리자 검토를 기다려주세요.' })
      setReason('')
      loadMyRequests()
    } catch (error: any) {
      toast({ title: '오류', description: error.message || '신청 중 오류가 발생했습니다', variant: 'destructive' })
    } finally {
      setLoading(false)
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <BrowseHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <BrowseHeader />
      <div className="container mx-auto px-4 md:px-12 py-24">

        <div className="mb-8">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition">
            <ArrowLeft className="h-4 w-4" />뒤로 가기
          </button>
          <h1 className="text-4xl font-bold mb-2">광고주 신청</h1>
          <p className="text-muted-foreground">광고 영상을 업로드하고 누끼 이미지를 생성하려면 광고주 권한이 필요합니다.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5" />새로운 광고주 신청
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasPending ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">대기 중인 신청이 있습니다</h3>
                    <p className="text-muted-foreground">현재 신청이 검토 중입니다. 결과를 기다려주세요.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">신청 이유 <span className="text-red-500">*</span></label>
                      <Textarea
                        placeholder="광고주 신청 이유를 작성해주세요 (최소 50자)&#10;&#10;예: 운영 중인 브랜드 소개, 광고 영상 종류, 마케팅 목적 등"
                        rows={8}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground mt-2">{reason.length} / 50자 이상</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">📝 작성 가이드</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• 운영 중인 브랜드 또는 서비스 소개</li>
                        <li>• 업로드할 광고 영상의 종류와 목적</li>
                        <li>• 누끼 이미지를 활용할 계획</li>
                      </ul>
                    </div>
                    <Button
                      onClick={handleSubmit}
                      disabled={loading || reason.trim().length < 50}
                      className="w-full"
                    >
                      {loading ? '제출 중...' : '광고주 신청하기'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader><CardTitle>광고주 혜택</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">🎬 광고 영상 업로드</h4>
                  <p className="text-sm text-muted-foreground">광고 영상을 플랫폼에 업로드할 수 있습니다.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">✂️ AI 누끼 이미지 생성</h4>
                  <p className="text-sm text-muted-foreground">영상 속 물체의 누끼 이미지를 자동으로 추출합니다.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">📊 전용 스튜디오</h4>
                  <p className="text-sm text-muted-foreground">광고주 전용 스튜디오에서 영상과 누끼 이미지를 관리합니다.</p>
                </div>
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">⏱ 검토 소요 시간</h4>
                  <p className="text-sm text-muted-foreground">신청 후 보통 1~3일 내 결과가 안내됩니다.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {myRequests.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">내 신청 내역</h2>
            <div className="space-y-4">
              {myRequests.map((req) => (
                <Card key={req.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(req.status)}
                      <span className="text-sm text-muted-foreground">
                        {new Date(req.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{req.reason}</p>
                    {req.adminComment && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <p className="text-sm font-semibold mb-1">관리자 의견:</p>
                        <p className="text-sm text-muted-foreground">{req.adminComment}</p>
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
