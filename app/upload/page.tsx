"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { BrowseHeader } from "@/components/browse-header"
import { Upload, X, FileVideo } from "lucide-react"
import Link from "next/link"

export default function UploadPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showAdSetup, setShowAdSetup] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    thumbnail: null as File | null,
  })

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith("video/")) {
        setUploadedFile(file)
      } else {
        alert("비디오 파일만 업로드 가능합니다.")
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type.startsWith("video/")) {
        setUploadedFile(file)
      } else {
        alert("비디오 파일만 업로드 가능합니다.")
      }
    }
  }

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setFormData({ ...formData, thumbnail: files[0] })
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    setShowAdSetup(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Backend integration will be added later
    console.log("Upload data:", { uploadedFile, formData })
  }

  const handleContinueToAdSetup = () => {
    if (!uploadedFile) {
      alert("먼저 영상을 업로드해주세요.")
      return
    }
    if (!formData.title.trim()) {
      alert("제목을 입력해주세요.")
      return
    }
    setShowAdSetup(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <BrowseHeader />

      <div className="container mx-auto px-4 py-24 md:px-12">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-8 text-4xl font-bold">콘텐츠 업로드</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Video Upload Section */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">영상 파일</Label>

              {!uploadedFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
                    isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/30 bg-muted/30"
                  }`}
                >
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />

                  <div className="space-y-4">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                      <Upload className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">영상 파일을 드래그하거나 클릭하여 선택하세요</p>
                      <p className="mt-2 text-sm text-muted-foreground">MP4, MOV, AVI 등 비디오 형식 지원</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                    <FileVideo className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">{(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={removeFile}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>

            {/* Video Details */}
            {uploadedFile && (
              <div className="space-y-6 rounded-lg border border-border bg-muted/20 p-6">
                <h2 className="text-xl font-semibold">영상 정보</h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">제목 *</Label>
                    <Input
                      id="title"
                      placeholder="매력적인 제목을 입력하세요"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">설명</Label>
                    <Textarea
                      id="description"
                      placeholder="영상에 대한 설명을 입력하세요"
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="category">카테고리</Label>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">카테고리 선택</option>
                        <option value="movie">영화</option>
                        <option value="series">시리즈</option>
                        <option value="documentary">다큐멘터리</option>
                        <option value="entertainment">예능</option>
                        <option value="animation">애니메이션</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags">태그</Label>
                      <Input
                        id="tags"
                        placeholder="쉼표로 구분 (예: 액션, SF, 스릴러)"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thumbnail">썸네일 이미지</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="thumbnail"
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailSelect}
                        className="flex-1"
                      />
                      {formData.thumbnail && <Badge variant="secondary">{formData.thumbnail.name}</Badge>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {uploadedFile && !showAdSetup && (
              <div className="flex justify-between gap-4">
                <Link href="/browse">
                  <Button type="button" variant="outline">
                    취소
                  </Button>
                </Link>
                <div className="flex gap-4">
                  <Button type="button" onClick={handleSubmit} variant="outline">
                    광고 없이 업로드
                  </Button>
                  <Link href="/upload/ads">
                    <Button type="button">광고 설정하러 가기</Button>
                  </Link>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
