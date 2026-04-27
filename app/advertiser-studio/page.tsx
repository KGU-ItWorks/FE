'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { Upload, Video, CheckCircle, Clock, XCircle, Loader2, ArrowRight } from 'lucide-react'

interface Stats {
  total: number
  pending: number
  processing: number
  done: number
  failed: number
}

interface AdVideo {
  id: number
  title: string
  status: 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED'
  createdAt: string
}

export default function AdvertiserStudioPage() {
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, processing: 0, done: 0, failed: 0 })
  const [recentVideos, setRecentVideos] = useState<AdVideo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const data = await apiClient.get<any>('/api/v1/advertiser/videos?page=0&size=5')
      const videos: AdVideo[] = data.content || []
      setRecentVideos(videos)
      setStats({
        total: data.totalElements || 0,
        pending:    videos.filter(v => v.status === 'PENDING').length,
        processing: videos.filter(v => v.status === 'PROCESSING').length,
        done:       videos.filter(v => v.status === 'DONE').length,
        failed:     videos.filter(v => v.status === 'FAILED').length,
      })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: AdVideo['status']) => {
    switch (status) {
      case 'PENDING':    return <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />대기 중</span>
      case 'PROCESSING': return <span className="flex items-center gap-1 text-xs text-blue-500"><Loader2 className="h-3 w-3 animate-spin" />처리 중</span>
      case 'DONE':       return <span className="flex items-center gap-1 text-xs text-green-500"><CheckCircle className="h-3 w-3" />완료</span>
      case 'FAILED':     return <span className="flex items-center gap-1 text-xs text-destructive"><XCircle className="h-3 w-3" />실패</span>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">대시보드</h1>
        <p className="text-muted-foreground mt-1">광고 영상 업로드 현황을 한눈에 확인하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '전체 영상', value: stats.total, color: 'text-foreground', bg: 'bg-card' },
          { label: '처리 대기', value: stats.pending, color: 'text-muted-foreground', bg: 'bg-card' },
          { label: '누끼 완료', value: stats.done, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: '처리 실패', value: stats.failed, color: 'text-destructive', bg: 'bg-destructive/10' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} border border-border rounded-xl p-5`}>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-sm text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* 빠른 메뉴 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/advertiser-studio/upload">
          <div className="group border border-border rounded-xl p-6 hover:border-yellow-500 hover:bg-yellow-500/5 transition cursor-pointer">
            <Upload className="h-8 w-8 text-yellow-500 mb-3" />
            <h3 className="font-semibold text-lg">광고 영상 업로드</h3>
            <p className="text-sm text-muted-foreground mt-1">새 광고 영상을 업로드하고 AI 누끼 처리를 시작합니다</p>
            <div className="flex items-center gap-1 text-yellow-500 text-sm mt-3 group-hover:gap-2 transition-all">
              업로드하기 <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </Link>
        <Link href="/advertiser-studio/videos">
          <div className="group border border-border rounded-xl p-6 hover:border-yellow-500 hover:bg-yellow-500/5 transition cursor-pointer">
            <Video className="h-8 w-8 text-yellow-500 mb-3" />
            <h3 className="font-semibold text-lg">영상 관리</h3>
            <p className="text-sm text-muted-foreground mt-1">업로드한 영상과 누끼 이미지 처리 결과를 관리합니다</p>
            <div className="flex items-center gap-1 text-yellow-500 text-sm mt-3 group-hover:gap-2 transition-all">
              관리하기 <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </Link>
      </div>

      {/* 최근 업로드 */}
      {recentVideos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">최근 업로드</h2>
            <Link href="/advertiser-studio/videos" className="text-sm text-yellow-500 hover:underline">
              전체 보기 →
            </Link>
          </div>
          <div className="space-y-3">
            {recentVideos.map((video) => (
              <div key={video.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <Video className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <p className="font-medium text-sm">{video.title}</p>
                </div>
                <div className="flex items-center gap-4">
                  {getStatusBadge(video.status)}
                  <span className="text-xs text-muted-foreground">
                    {new Date(video.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recentVideos.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">아직 업로드한 영상이 없어요</h3>
          <p className="text-muted-foreground text-sm mb-6">첫 광고 영상을 업로드하고 AI 누끼 처리를 시작해보세요</p>
          <Link href="/advertiser-studio/upload">
            <button className="px-6 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition">
              영상 업로드하기
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}
