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

type UploadStatus = "idle" | "uploading" | "success" | "error"

export default function UploadPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading } = useAuth()

  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle")
  const [uploadProgress, setUploadProgress] = useState(0)

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
  }, [user, isLoading, router])

  if (!isLoading && user && user.role === 'ROLE_USER') {
    return (
        <div className="min-h-screen bg-background">
          <BrowseHeader />
          <div className="container mx-auto px-4 py-24 md:px-12 text-center space-y-6">
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
                <Button size="lg" className="w-full sm:w-auto">업로더 승급 신청하기</Button>
              </Link>
              <div className="pt-4">
                <Link href="/browse">
                  <Button variant="outline">홈으로 돌아가기</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
    )
  }

  if (isLoading || !user || (user.role !== 'ROLE_UPLOADER' && user.role !== 'ROLE_ADMIN')) {
    return null
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file?.type.startsWith("video/")) {
      setUploadedFile(file)
    } else if (file) {
      toast({ title: "파일 형식 오류", description: "비디오 파일만 업로드 가능합니다.", variant: "destructive" })
    }
  }

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, thumbnail: file })
    }
  }

  const handleUpload = async () => {
    if (!uploadedFile || !formData.title.trim()) return

    setUploadStatus("uploading")
    setUploadProgress(0)

    try {
      await videoApi.uploadVideo(
          uploadedFile,
          {
            title: formData.title,
            description: formData.description || undefined,
            category: formData.category || undefined,
            ageRating: formData.ageRating || undefined,
          },
          formData.thumbnail,
          (progress) => setUploadProgress(progress)
      )

      setUploadStatus("success")
      toast({ title: "업로드 완료!", description: "영상이 성공적으로 전송되었습니다." })

      setTimeout(() => {
        router.push("/profiles")
      }, 3000)

    } catch (error) {
      setUploadStatus("error")
      toast({
        title: "업로드 실패",
        description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  return (
      <div className="min-h-screen bg-background">
        <BrowseHeader />
        <div className="container mx-auto px-4 py-24 md:px-12 max-w-5xl">
          <h1 className="mb-8 text-4xl font-bold">콘텐츠 업로드</h1>

          <div className="space-y-8">
            {uploadStatus === "success" ? (
                <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-12 text-center">
                  <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
                  <h3 className="mb-2 text-xl font-semibold">업로드 완료!</h3>
                  <p className="text-muted-foreground">
                    영상 파일이 성공적으로 업로드되었습니다. 인코딩이 완료되면 시청할 수 있습니다.
                  </p>
                  <p className="mt-4 text-sm text-muted-foreground">잠시 후 내 영상 목록으로 이동합니다...</p>
                </div>
            ) : (
                <>
                  {/* 영상 파일 선택 */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">영상 파일</Label>
                    {!uploadedFile ? (
                        <div className="relative rounded-lg border-2 border-dashed p-12 text-center bg-muted/30">
                          <input type="file" accept="video/*" onChange={handleFileSelect} className="absolute inset-0 cursor-pointer opacity-0" disabled={uploadStatus === "uploading"} />
                          <Upload className="mx-auto h-10 w-10 text-primary mb-4" />
                          <p className="text-lg font-medium">영상 파일을 드래그하거나 클릭하여 선택하세요</p>
                          <p className="mt-2 text-sm text-muted-foreground">MP4, MOV, AVI 등 비디오 형식 지원 (최대 5GB)</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 rounded-lg border p-4 bg-muted/30">
                            <FileVideo className="h-8 w-8 text-primary" />
                            <div className="flex-1 truncate">
                              <p className="font-medium truncate">{uploadedFile.name}</p>
                              <p className="text-sm text-muted-foreground">{(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                            {uploadStatus !== "uploading" && (
                                <Button variant="ghost" size="icon" onClick={() => setUploadedFile(null)}><X /></Button>
                            )}
                          </div>
                          {uploadStatus === "uploading" && (
                              <div className="space-y-2 p-4 border rounded-lg bg-muted/20">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> 업로드 중...</span>
                                  <span>{Math.round(uploadProgress)}%</span>
                                </div>
                                <Progress value={uploadProgress} className="h-2" />
                              </div>
                          )}
                        </div>
                    )}
                  </div>

                  {/* 영상 정보 입력 */}
                  {uploadedFile && uploadStatus === "idle" && (
                      <div className="space-y-6 rounded-lg border border-border bg-muted/20 p-6">
                        <h2 className="text-xl font-semibold">영상 정보</h2>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="title">제목 *</Label>
                            <Input id="title" placeholder="매력적인 제목을 입력하세요" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="description">설명</Label>
                            <Textarea id="description" placeholder="영상에 대한 설명을 입력하세요" rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="category">카테고리</Label>
                              <select id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
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
                              <select id="ageRating" value={formData.ageRating} onChange={(e) => setFormData({ ...formData, ageRating: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
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
                              <Input id="thumbnail" type="file" accept="image/*" onChange={handleThumbnailSelect} className="flex-1" />
                              {formData.thumbnail && <Badge variant="secondary" className="max-w-[200px] truncate">{formData.thumbnail.name}</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">JPG, PNG (최대 5MB)</p>
                          </div>
                        </div>
                      </div>
                  )}

                  {/* 하단 버튼 영역 */}
                  {uploadedFile && uploadStatus === "idle" && (
                      <div className="flex justify-end gap-4">
                        <Link href="/browse">
                          <Button variant="outline">취소</Button>
                        </Link>
                        <Button onClick={handleUpload} disabled={!formData.title.trim()}>
                          업로드
                        </Button>
                      </div>
                  )}

                  {uploadStatus === "error" && (
                      <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 flex items-center gap-3 text-red-500">
                        <AlertCircle className="h-5 w-5" />
                        <p className="text-sm">업로드 실패. 다시 시도해주세요.</p>
                      </div>
                  )}
                </>
            )}
          </div>
        </div>
      </div>
  )
}