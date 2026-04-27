'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Upload, Video, Loader2 } from 'lucide-react'

export default function AdvertiserStudioUploadPage() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      toast({ title: '파일 오류', description: '영상 파일만 업로드할 수 있습니다', variant: 'destructive' })
      return
    }
    setVideoFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({ title: '입력 오류', description: '제목을 입력해주세요', variant: 'destructive' })
      return
    }
    if (!videoFile) {
      toast({ title: '파일 오류', description: '영상 파일을 선택해주세요', variant: 'destructive' })
      return
    }

    try {
      setUploading(true)

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      const formData = new FormData()
      formData.append('request', new Blob([JSON.stringify({ title, description })], { type: 'application/json' }))
      formData.append('videoFile', videoFile)

      const response = await fetch(`${baseUrl}/api/v1/advertiser/videos`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.message || '업로드에 실패했습니다')
      }

      toast({ title: '업로드 완료', description: 'AI 누끼 처리가 시작됩니다.' })
      router.push('/advertiser-studio/videos')
    } catch (error: any) {
      toast({ title: '업로드 실패', description: error.message, variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">광고 영상 업로드</h1>
        <p className="text-muted-foreground mt-1">업로드 후 AI가 자동으로 영상 속 물체의 누끼를 추출합니다</p>
      </div>

      {/* 파일 업로드 영역 */}
      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer
          ${dragOver ? 'border-yellow-500 bg-yellow-500/5' : 'border-border hover:border-yellow-500/50'}
          ${videoFile ? 'border-green-500 bg-green-500/5' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        />
        {videoFile ? (
          <div>
            <Video className="h-12 w-12 mx-auto mb-3 text-green-500" />
            <p className="font-semibold text-green-600 text-lg">{videoFile.name}</p>
            <p className="text-sm text-muted-foreground mt-1">{formatFileSize(videoFile.size)}</p>
            <Button variant="outline" size="sm" className="mt-3"
              onClick={(e) => { e.stopPropagation(); setVideoFile(null) }}>
              파일 변경
            </Button>
          </div>
        ) : (
          <div>
            <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="font-semibold text-lg">클릭하거나 파일을 드래그하세요</p>
            <p className="text-sm text-muted-foreground mt-1">MP4, MOV, AVI 등 영상 파일</p>
          </div>
        )}
      </div>

      {/* 영상 정보 */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-lg">영상 정보</h2>
        <div>
          <label className="block text-sm font-medium mb-2">제목 <span className="text-red-500">*</span></label>
          <Input placeholder="광고 영상 제목을 입력하세요" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">설명</label>
          <Textarea placeholder="영상 설명을 입력하세요 (선택)" rows={4} value={description}
            onChange={(e) => setDescription(e.target.value)} className="resize-none" />
        </div>
      </div>

      {/* 안내 */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-sm">
        <p className="font-semibold text-yellow-600 mb-2">⚡ 처리 안내</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• 업로드 완료 후 AI 누끼 처리가 자동으로 시작됩니다</li>
          <li>• 영상 길이에 따라 처리 시간이 달라질 수 있습니다</li>
          <li>• 처리 결과는 영상 관리 페이지에서 확인하세요</li>
        </ul>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={uploading || !videoFile || !title.trim()}
        className="w-full bg-yellow-500 text-black hover:bg-yellow-400 font-semibold"
        size="lg"
      >
        {uploading
          ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />업로드 중...</>
          : <><Upload className="h-4 w-4 mr-2" />광고 영상 업로드</>
        }
      </Button>
    </div>
  )
}
