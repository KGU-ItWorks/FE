'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { apiClient } from '@/lib/api-client'
import type { Video } from '@/lib/api'

interface EditVideoModalProps {
  video: Video | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditVideoModal({ video, isOpen, onClose, onSuccess }: EditVideoModalProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    ageRating: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title || '',
        description: video.description || '',
        category: video.category || '',
        ageRating: video.ageRating || ''
      })
    }
  }, [video])

  if (!isOpen || !video) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await apiClient.put(`/api/v1/videos/${video.id}`, formData)

      toast({
        title: '성공',
        description: '영상 정보가 수정되었습니다',
      })

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to update video:', error)
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '영상 수정 중 오류가 발생했습니다',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-card border border-border">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-6">
          <h2 className="text-2xl font-bold">영상 정보 수정</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              maxLength={200}
              placeholder="영상 제목을 입력하세요"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={6}
              maxLength={5000}
              placeholder="영상 설명을 입력하세요"
            />
            <div className="text-right text-sm text-muted-foreground">
              {formData.description.length} / 5000
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">카테고리</Label>
            <Select
              value={formData.category || undefined}
              onValueChange={(value) => handleChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="액션">액션</SelectItem>
                <SelectItem value="코미디">코미디</SelectItem>
                <SelectItem value="드라마">드라마</SelectItem>
                <SelectItem value="SF">SF</SelectItem>
                <SelectItem value="스릴러">스릴러</SelectItem>
                <SelectItem value="로맨스">로맨스</SelectItem>
                <SelectItem value="공포">공포</SelectItem>
                <SelectItem value="다큐멘터리">다큐멘터리</SelectItem>
                <SelectItem value="애니메이션">애니메이션</SelectItem>
                <SelectItem value="기타">기타</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Age Rating */}
          <div className="space-y-2">
            <Label htmlFor="ageRating">연령 등급</Label>
            <Select
              value={formData.ageRating || undefined}
              onValueChange={(value) => handleChange('ageRating', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="연령 등급 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="전체 관람가">전체 관람가</SelectItem>
                <SelectItem value="12+">12세 이상</SelectItem>
                <SelectItem value="15+">15세 이상</SelectItem>
                <SelectItem value="19+">19세 이상</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? '저장 중...' : '저장'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
