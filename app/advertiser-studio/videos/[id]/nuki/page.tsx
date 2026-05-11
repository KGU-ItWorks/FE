'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, ImageIcon, Loader2, XCircle, Clock } from 'lucide-react'

interface NukiImagesResponse {
  adVideoId: number
  status: string
  imageUrls: string[]
}

export default function NukiGalleryPage() {
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const [data, setData] = useState<NukiImagesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    loadNukiImages()
  }, [id])

  // PROCESSING/PENDING 상태면 30초마다 자동 갱신
  useEffect(() => {
    if (!data || data.status === 'DONE' || data.status === 'FAILED') return
    const timer = setInterval(loadNukiImages, 30_000)
    return () => clearInterval(timer)
  }, [data?.status])

  const loadNukiImages = async () => {
    try {
      setLoading(true)
      const result = await apiClient.get<NukiImagesResponse>(
        `/api/v1/advertiser/videos/${id}/nuki`
      )
      setData(result)
    } catch {
      toast({ title: '불러오기 실패', description: '누끼 이미지를 불러오지 못했습니다', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (url: string) => {
    const filename = url.split('/').pop() ?? 'nuki.png'
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
  }

  const handleDownloadAll = () => {
    if (!data) return
    data.imageUrls.forEach((url, i) => {
      setTimeout(() => handleDownload(url), i * 150)
    })
  }

  const renderBody = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
        </div>
      )
    }

    if (!data) return null

    if (data.status === 'PROCESSING' || data.status === 'PENDING') {
      return (
        <div className="text-center py-20 border border-dashed border-border rounded-xl space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-500 mx-auto" />
          <p className="font-semibold text-lg">AI가 누끼를 추출하는 중입니다</p>
          <p className="text-sm text-muted-foreground">
            영상 길이에 따라 30분~1시간 이상 소요될 수 있습니다.<br />
            처리가 완료되면 자동으로 업데이트됩니다.
          </p>
          <p className="text-xs text-muted-foreground">30초마다 자동 새로고침</p>
        </div>
      )
    }

    if (data.status === 'FAILED') {
      return (
        <div className="text-center py-20 border border-dashed border-destructive/40 rounded-xl space-y-3 bg-destructive/5">
          <XCircle className="h-12 w-12 text-destructive mx-auto" />
          <p className="font-semibold text-lg">누끼 처리에 실패했습니다</p>
          <p className="text-sm text-muted-foreground">영상을 다시 업로드하거나 관리자에게 문의해주세요.</p>
        </div>
      )
    }

    if (data.imageUrls.length === 0) {
      return (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="font-semibold">감지된 객체가 없습니다</p>
          <p className="text-sm text-muted-foreground mt-1">선택한 카테고리의 객체가 영상에서 발견되지 않았습니다</p>
        </div>
      )
    }

    return (
      <>
        <p className="text-sm text-muted-foreground">총 {data.imageUrls.length}장</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {data.imageUrls.map((url) => (
            <div
              key={url}
              className="group relative aspect-square rounded-xl border border-border bg-muted overflow-hidden cursor-pointer hover:border-yellow-500 transition"
              style={{ backgroundImage: 'repeating-conic-gradient(#e5e7eb 0% 25%, #ffffff 0% 50%)', backgroundSize: '20px 20px' }}
              onClick={() => setSelected(url)}
            >
              <img
                src={url}
                alt="누끼 이미지"
                className="w-full h-full object-contain"
              />
              <button
                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition bg-black/60 rounded-lg p-1.5"
                onClick={(e) => { e.stopPropagation(); handleDownload(url) }}
              >
                <Download className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/advertiser-studio/videos">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />뒤로
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">누끼 이미지 갤러리</h1>
            <p className="text-muted-foreground text-sm mt-0.5">영상 #{id} · AI가 추출한 누끼 이미지</p>
          </div>
        </div>
        {data?.status === 'DONE' && data.imageUrls.length > 0 && (
          <Button variant="outline" onClick={handleDownloadAll}>
            <Download className="h-4 w-4 mr-2" />전체 다운로드
          </Button>
        )}
      </div>

      {renderBody()}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-w-lg w-full rounded-2xl overflow-hidden bg-muted"
            style={{ backgroundImage: 'repeating-conic-gradient(#e5e7eb 0% 25%, #ffffff 0% 50%)', backgroundSize: '20px 20px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={selected} alt="누끼 이미지" className="w-full object-contain max-h-[70vh]" />
            <div className="absolute top-3 right-3 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => handleDownload(selected)}>
                <Download className="h-3.5 w-3.5 mr-1" />다운로드
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setSelected(null)}>닫기</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
