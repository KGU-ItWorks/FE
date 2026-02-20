"use client"

import { useState, useEffect } from "react"
import { BrowseHeader } from "@/components/browse-header"
import { EditVideoModal } from "@/components/edit-video-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { videoApi, type Video } from "@/lib/api"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Video as VideoIcon, Clock, CheckCircle, XCircle, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

export default function MyVideosPage() {
  const { toast } = useToast()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [deleteVideoId, setDeleteVideoId] = useState<number | null>(null)

  useEffect(() => {
    loadVideos()
  }, [page])

  const loadVideos = async () => {
    try {
      setLoading(true)
      const response = await videoApi.getMyVideos(page, 20)
      setVideos(response.content)
      setTotalPages(response.totalPages)
    } catch (error) {
      console.error("Failed to load videos:", error)
      toast({
        title: "영상 목록 로드 실패",
        description: "영상 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (video: Video) => {
    setSelectedVideo(video)
    setShowEditModal(true)
  }

  const handleDelete = async () => {
    if (!deleteVideoId) return

    try {
      await apiClient.delete(`/api/v1/videos/${deleteVideoId}`)

      toast({
        title: '성공',
        description: '영상이 삭제되었습니다',
      })

      // 목록 새로고침
      loadVideos()
    } catch (error) {
      console.error('Failed to delete video:', error)
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '영상 삭제 중 오류가 발생했습니다',
        variant: 'destructive',
      })
    } finally {
      setDeleteVideoId(null)
    }
  }

  const getStatusBadge = (status: Video["status"]) => {
    switch (status) {
      case "UPLOADED":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            업로드 완료
          </Badge>
        )
      case "ENCODING":
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            인코딩 중
          </Badge>
        )
      case "COMPLETED":
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-green-500">
            <CheckCircle className="h-3 w-3" />
            완료
          </Badge>
        )
      case "FAILED":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            실패
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "-"
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <BrowseHeader />
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <BrowseHeader />

      <div className="container mx-auto px-4 py-24 md:px-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold">내 영상</h1>
          <Link href="/upload">
            <Button>
              <VideoIcon className="mr-2 h-4 w-4" />
              영상 업로드
            </Button>
          </Link>
        </div>

        {videos.length === 0 ? (
          <div className="rounded-lg border border-border bg-muted/20 p-12 text-center">
            <VideoIcon className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">업로드한 영상이 없습니다</h2>
            <p className="mb-6 text-muted-foreground">첫 번째 영상을 업로드해보세요!</p>
            <Link href="/upload">
              <Button>영상 업로드하기</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {videos.map((video) => (
              <div key={video.id} className="rounded-lg border border-border bg-card p-6 transition-colors hover:bg-muted/20">
                <div className="flex items-start gap-6">
                  {/* Thumbnail */}
                  <div className="flex h-32 w-48 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <VideoIcon className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>

                  {/* Video Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold">{video.title}</h3>
                        {video.description && (
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{video.description}</p>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(video)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          수정
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteVideoId(video.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          삭제
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {getStatusBadge(video.status)}
                      {video.category && <Badge variant="outline">{video.category}</Badge>}
                      {video.ageRating && <Badge variant="outline">{video.ageRating}</Badge>}
                      {video.approvalStatus === "PENDING" && <Badge variant="secondary">검토 대기</Badge>}
                      {video.approvalStatus === "APPROVED" && <Badge variant="default" className="bg-green-500">승인됨</Badge>}
                      {video.approvalStatus === "REJECTED" && <Badge variant="destructive">거부됨</Badge>}
                    </div>

                    {/* Encoding Progress */}
                    {video.status === "ENCODING" && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">인코딩 진행률</span>
                          <span className="font-medium">{video.encodingProgress}%</span>
                        </div>
                        <Progress value={video.encodingProgress} className="h-2" />
                      </div>
                    )}

                    {/* Video Metadata */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>크기: {formatFileSize(video.originalFileSize)}</span>
                      {video.durationSeconds && <span>길이: {formatDuration(video.durationSeconds)}</span>}
                      {video.resolution && <span>해상도: {video.resolution}</span>}
                      <span>조회수: {video.viewCount.toLocaleString()}</span>
                    </div>

                    {/* Watch Button */}
                    {video.status === "COMPLETED" && (
                      <div>
                        <Link href={`/watch/${video.id}`}>
                          <Button size="sm">시청하기</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-6">
                <Button disabled={page === 0} onClick={() => setPage(page - 1)} variant="outline">
                  이전
                </Button>
                <div className="flex items-center px-4">
                  <span className="text-sm text-muted-foreground">
                    {page + 1} / {totalPages}
                  </span>
                </div>
                <Button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} variant="outline">
                  다음
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditVideoModal
        video={selectedVideo}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedVideo(null)
        }}
        onSuccess={loadVideos}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteVideoId !== null} onOpenChange={() => setDeleteVideoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>영상을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 취소할 수 없습니다. 영상이 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
