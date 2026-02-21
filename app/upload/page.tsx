"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BrowseHeader } from "@/components/browse-header"
import { Upload, X, FileVideo, CheckCircle, AlertCircle, Loader2, Lock } from "lucide-react"
import Link from "next/link"
import { videoApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"

type UploadStatus = "idle" | "uploading" | "processing" | "success" | "error"

export default function UploadPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading } = useAuth()

  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedVideoId, setUploadedVideoId] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    ageRating: "",
    thumbnail: null as File | null,
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading])

  // 권한 체크: ROLE_USER는 업로드 불가
  if (!isLoading && user && user.role === 'ROLE_USER') {
    return (
      <div className="min-h-screen bg-background">
        <BrowseHeader />
        <div className="container mx-auto px-4 py-24 md:px-12">
          <div className="mx-auto max-w-2xl text-center space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Lock className="h-10 w-10 text-muted-foreground" />
            </div>
            
            <h1 className="text-4xl font-bold">업로더 권한이 필요합니다</h1>
            
            <p className="text-lg text-muted-foreground">
              영상을 업로드하려면 업로더 권한이 필요합니다.<br />
              관리자에게 승급 신청을 해주세요.
            </p>

            <div className="space-y-4 pt-4">
              <Link href="/upgrade-to-uploader">
                <Button size="lg" className="w-full sm:w-auto">
                  업로더 승급 신청하기
                </Button>
              </Link>
              
              <div className="pt-4">
                <Link href="/browse">
                  <Button variant="outline">홈으로 돌아가기</Button>
                </Link>
              </div>
            </div>

            <div className="mt-8 p-6 bg-muted rounded-lg text-left">
              <h3 className="font-semibold mb-4">💡 업로더 권한이란?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ 영상을 업로드하고 공유할 수 있는 권한입니다</li>
                <li>✓ 관리자의 승인을 받아야 부여됩니다</li>
                <li>✓ 승급 신청 후 1-3일 내 검토가 완료됩니다</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 로딩 중이거나 권한이 없으면 아무것도 표시하지 않음
  if (isLoading || !user || (user.role !== 'ROLE_UPLOADER' && user.role !== 'ROLE_ADMIN')) {
    return null
  }

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
        toast({
          title: "파일 형식 오류",
          description: "비디오 파일만 업로드 가능합니다.",
          variant: "destructive",
        })
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
        toast({
          title: "파일 형식 오류",
          description: "비디오 파일만 업로드 가능합니다.",
          variant: "destructive",
        })
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
    setUploadStatus("idle")
    setUploadProgress(0)
  }

  const handleUploadWithoutAds = async () => {
    if (!uploadedFile) {
      toast({
        title: "파일 선택 필요",
        description: "먼저 영상을 업로드해주세요.",
        variant: "destructive",
      })
      return
    }

    if (!formData.title.trim()) {
      toast({
        title: "제목 입력 필요",
        description: "제목을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setUploadStatus("uploading")
    setUploadProgress(0)

    try {
      const response = await videoApi.uploadVideo(
        uploadedFile,
        {
          title: formData.title,
          description: formData.description || undefined,
          category: formData.category || undefined,
          ageRating: formData.ageRating || undefined,
        },
        formData.thumbnail,
        (progress) => {
          setUploadProgress(progress)
        }
      )

      setUploadedVideoId(response.id)
      setUploadStatus("processing")

      toast({
        title: "업로드 완료!",
        description: "영상이 업로드되었습니다. 인코딩이 진행 중입니다.",
      })

      // 3초 후 내 영상 목록으로 이동
      setTimeout(() => {
        router.push("/profiles")
      }, 3000)

    } catch (error) {
      console.error("Upload error:", error)
      setUploadStatus("error")

      toast({
        title: "업로드 실패",
        description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const getStatusMessage = () => {
    switch (uploadStatus) {
      case "uploading":
        return "업로드 중..."
      case "processing":
        return "인코딩 대기 중..."
      case "success":
        return "업로드 완료!"
      case "error":
        return "업로드 실패"
      default:
        return ""
    }
  }

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case "uploading":
      case "processing":
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const isUploading = uploadStatus === "uploading" || uploadStatus === "processing"

  return (
    <div className="min-h-screen bg-background">
      <BrowseHeader />

      <div className="container mx-auto px-4 py-24 md:px-12">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-8 text-4xl font-bold">콘텐츠 업로드</h1>

          <div className="space-y-8">
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
                    disabled={isUploading}
                  />

                  <div className="space-y-4">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                      <Upload className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">영상 파일을 드래그하거나 클릭하여 선택하세요</p>
                      <p className="mt-2 text-sm text-muted-foreground">MP4, MOV, AVI 등 비디오 형식 지원 (최대 5GB)</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                      <FileVideo className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    {!isUploading && (
                      <Button type="button" variant="ghost" size="icon" onClick={removeFile}>
                        <X className="h-5 w-5" />
                      </Button>
                    )}
                  </div>

                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon()}
                          <span className="font-medium">{getStatusMessage()}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {uploadStatus === "uploading" ? `${Math.round(uploadProgress)}%` : ""}
                        </span>
                      </div>
                      {uploadStatus === "uploading" && <Progress value={uploadProgress} className="h-2" />}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Video Details */}
            {uploadedFile && uploadStatus === "idle" && (
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
                      disabled={isUploading}
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
                      disabled={isUploading}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="category">카테고리</Label>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={isUploading}
                      >
                        <option value="">카테고리 선택</option>
                        <option value="영화">영화</option>
                        <option value="시리즈">시리즈</option>
                        <option value="다큐멘터리">다큐멘터리</option>
                        <option value="예능">예능</option>
                        <option value="애니메이션">애니메이션</option>
                        <option value="액션">액션</option>
                        <option value="드라마">드라마</option>
                        <option value="SF">SF</option>
                        <option value="스릴러">스릴러</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ageRating">연령 등급</Label>
                      <select
                        id="ageRating"
                        value={formData.ageRating}
                        onChange={(e) => setFormData({ ...formData, ageRating: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={isUploading}
                      >
                        <option value="">등급 선택</option>
                        <option value="전체">전체 관람가</option>
                        <option value="12+">12세 이상</option>
                        <option value="15+">15세 이상</option>
                        <option value="19+">19세 이상</option>
                      </select>
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
                        disabled={isUploading}
                      />
                      {formData.thumbnail && <Badge variant="secondary">{formData.thumbnail.name}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">JPG, PNG (최대 5MB)</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {uploadedFile && uploadStatus === "idle" && (
              <div className="flex justify-between gap-4">
                <Link href="/browse">
                  <Button type="button" variant="outline" disabled={isUploading}>
                    취소
                  </Button>
                </Link>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    onClick={handleUploadWithoutAds}
                    disabled={isUploading || !formData.title.trim()}
                  >
                    광고 없이 업로드
                  </Button>
                  <Link href="/upload/ads">
                    <Button type="button" variant="outline" disabled={isUploading}>
                      광고 설정하러 가기
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Success Message */}
            {uploadStatus === "processing" && (
              <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-6 text-center">
                <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
                <h3 className="mb-2 text-xl font-semibold">업로드 완료!</h3>
                <p className="text-muted-foreground">
                  영상이 성공적으로 업로드되었습니다. 인코딩이 완료되면 시청할 수 있습니다.
                </p>
                <p className="mt-4 text-sm text-muted-foreground">잠시 후 내 영상 목록으로 이동합니다...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
