'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, ImageIcon, Loader2 } from 'lucide-react'

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
        {data && data.imageUrls.length > 0 && (
          <Button variant="outline" onClick={handleDownloadAll}>
            <Download className="h-4 w-4 mr-2" />전체 다운로드
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
        </div>
      ) : !data || data.imageUrls.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="font-semibold">누끼 이미지가 없습니다</p>
          <p className="text-sm text-muted-foreground mt-1">AI 처리가 완료되지 않았거나 감지된 객체가 없습니다</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">총 {data.imageUrls.length}장</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {data.imageUrls.map((url) => (
              <div
                key={url}
                className="group relative aspect-square rounded-xl border border-border bg-muted overflow-hidden cursor-pointer hover:border-yellow-500 transition"
                style={{ backgroundImage: 'url(/checkerboard.png)', backgroundSize: '20px' }}
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
      )}

      {/* 라이트박스 */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-w-lg w-full rounded-2xl overflow-hidden bg-muted"
            style={{ backgroundImage: 'url(/checkerboard.png)', backgroundSize: '20px' }}
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
