"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { videoApi, type Video } from "@/lib/api";
import { BrowseHeader } from "@/components/browse-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";

export default function VideoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const videoId = parseInt(resolvedParams.id);
  const router = useRouter();
  const { toast } = useToast();

  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideo();
    
    // 인코딩 중인 경우 주기적으로 상태 확인
    const interval = setInterval(() => {
      if (video?.status === "ENCODING") {
        loadVideo();
      }
    }, 3000); // 3초마다 확인

    return () => clearInterval(interval);
  }, [videoId, video?.status]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      const data = await videoApi.getVideoStatus(videoId);
      setVideo(data);
    } catch (error: any) {
      console.error("Failed to load video:", error);
      toast({
        title: "영상 정보 로드 실패",
        description: "영상 정보를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Video["status"]) => {
    switch (status) {
      case "UPLOADED":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            업로드 완료
          </Badge>
        );
      case "ENCODING":
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            인코딩 중
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge
            variant="default"
            className="flex items-center gap-1 bg-green-500"
          >
            <CheckCircle className="h-3 w-3" />
            완료
          </Badge>
        );
      case "FAILED":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            실패
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "-";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ko-KR");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <BrowseHeader />
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-background">
        <BrowseHeader />
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="mb-4 text-2xl font-bold">영상을 찾을 수 없습니다</h2>
          <Button onClick={() => router.push("/my-videos")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BrowseHeader />

      <div className="container mx-auto px-4 py-24 md:px-12">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/my-videos")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로
          </Button>
          <h1 className="text-4xl font-bold">{video.title}</h1>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 md:col-span-2">
            {/* Thumbnail */}
            <div className="aspect-video overflow-hidden rounded-lg bg-muted">
              {video.thumbnailUrl ? (
                <img
                  src={`http://localhost:8080${video.thumbnailUrl}`}
                  alt={video.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Play className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Description */}
            {video.description && (
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="mb-3 text-xl font-semibold">설명</h2>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {video.description}
                </p>
              </div>
            )}

            {/* Encoding Progress */}
            {video.status === "ENCODING" && (
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="mb-3 text-xl font-semibold">인코딩 진행 상태</h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">진행률</span>
                    <span className="font-semibold">{video.encodingProgress}%</span>
                  </div>
                  <Progress value={video.encodingProgress} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    인코딩이 진행 중입니다. 완료되면 자동으로 업데이트됩니다.
                  </p>
                </div>
              </div>
            )}

            {/* Rejection Reason */}
            {video.approvalStatus === "REJECTED" && video.rejectionReason && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
                <h2 className="mb-3 text-xl font-semibold text-destructive">
                  거부 사유
                </h2>
                <p className="text-muted-foreground">{video.rejectionReason}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">상태</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">처리 상태</span>
                  {getStatusBadge(video.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">승인 상태</span>
                  {video.approvalStatus === "PENDING" && (
                    <Badge variant="secondary">검토 대기</Badge>
                  )}
                  {video.approvalStatus === "APPROVED" && (
                    <Badge variant="default" className="bg-green-500">
                      승인됨
                    </Badge>
                  )}
                  {video.approvalStatus === "REJECTED" && (
                    <Badge variant="destructive">거부됨</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Metadata Card */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">정보</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">파일 크기:</span>
                  <p className="font-medium">
                    {formatFileSize(video.originalFileSize)}
                  </p>
                </div>
                {video.durationSeconds && (
                  <div>
                    <span className="text-muted-foreground">길이:</span>
                    <p className="font-medium">
                      {formatDuration(video.durationSeconds)}
                    </p>
                  </div>
                )}
                {video.resolution && (
                  <div>
                    <span className="text-muted-foreground">해상도:</span>
                    <p className="font-medium">{video.resolution}</p>
                  </div>
                )}
                {video.videoCodec && (
                  <div>
                    <span className="text-muted-foreground">비디오 코덱:</span>
                    <p className="font-medium">{video.videoCodec}</p>
                  </div>
                )}
                {video.audioCodec && (
                  <div>
                    <span className="text-muted-foreground">오디오 코덱:</span>
                    <p className="font-medium">{video.audioCodec}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">조회수:</span>
                  <p className="font-medium">{video.viewCount.toLocaleString()}회</p>
                </div>
                {video.category && (
                  <div>
                    <span className="text-muted-foreground">카테고리:</span>
                    <p className="font-medium">{video.category}</p>
                  </div>
                )}
                {video.ageRating && (
                  <div>
                    <span className="text-muted-foreground">연령 등급:</span>
                    <p className="font-medium">{video.ageRating}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">업로드 일시:</span>
                  <p className="font-medium">{formatDate(video.createdAt)}</p>
                </div>
                {video.publishedAt && (
                  <div>
                    <span className="text-muted-foreground">공개 일시:</span>
                    <p className="font-medium">{formatDate(video.publishedAt)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Card */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">작업</h2>
              <div className="space-y-2">
                {video.status === "COMPLETED" && (
                  <Link href={`/watch/${video.id}`} className="block">
                    <Button className="w-full">
                      <Play className="mr-2 h-4 w-4" />
                      시청하기
                    </Button>
                  </Link>
                )}
                <Button variant="outline" className="w-full" disabled>
                  <Pencil className="mr-2 h-4 w-4" />
                  수정하기 (준비 중)
                </Button>
                <Button variant="destructive" className="w-full" disabled>
                  <Trash2 className="mr-2 h-4 w-4" />
                  삭제하기 (준비 중)
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
