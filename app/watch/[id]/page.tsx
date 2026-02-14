"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import { videoApi } from "@/lib/api";
import { ArrowLeft, ThumbsUp, ThumbsDown, Plus, Volume2 } from "lucide-react";

// API 데이터 구조에 맞춰 string | null 허용
interface Video {
  id: number;
  title: string;
  description: string | null;
  cloudfrontUrl: string | null;
  s3Url: string | null;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  resolution: string | null;
  viewCount: number;
  createdAt: string;
  category: string | null;
  ageRating: string | null;
  uploader?: {
    id: number;
    username: string;
  };
  uploaderName: string;
  status?: string;
}

export default function WatchPage({
                                    params,
                                  }: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const videoId = parseInt(resolvedParams.id);
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoplay = searchParams?.get('autoplay') === 'true';

  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        // 에러 수정: videoId.toString() 대신 숫자 타입인 videoId를 그대로 전달합니다.
        const data = await videoApi.getVideoById(videoId);
        setVideo(data as unknown as Video);

        if (data.category) {
          loadRelatedVideos(data.category);
        }
      } catch (err: any) {
        console.error("Failed to fetch video:", err);
        setError(err.message || "영상을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (!isNaN(videoId)) {
      fetchVideo();
    }
  }, [videoId]);

  const loadRelatedVideos = async (category: string) => {
    try {
      const response = await videoApi.getPublishedVideos(0, 20);
      const related = response.content
          .filter(v =>
              v.id !== videoId &&
              v.status?.toUpperCase() === "COMPLETED" &&
              v.category === category
          )
          .slice(0, 6);
      setRelatedVideos(related as unknown as Video[]);
    } catch (error) {
      console.error("Failed to load related videos:", error);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    }
    return `${minutes}분`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "" : date.getFullYear() + "년";
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-400">영상 로딩 중...</p>
          </div>
        </div>
    );
  }

  if (error || !video) {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              영상을 찾을 수 없습니다
            </h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
                onClick={() => router.push("/browse")}
                className="px-6 py-2 bg-white text-black rounded hover:bg-gray-200 font-semibold"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-black">
        <div className="relative w-full bg-black">
          <VideoPlayer
              src={video.cloudfrontUrl || video.s3Url || ""}
              poster={
                video.thumbnailUrl
                    ? `http://localhost:8080${video.thumbnailUrl}`
                    : undefined
              }
              autoplay={autoplay}
          />
        </div>

        <div className="fixed top-6 left-6 z-50">
          <button
              onClick={() => router.push("/browse")}
              className="flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-full transition"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">홈</span>
          </button>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {video.title}
            </h1>

            <div className="flex items-center gap-4 flex-wrap">
              <button className="flex items-center gap-2 px-6 py-2 bg-white text-black rounded hover:bg-gray-200 font-semibold transition">
                <ThumbsUp className="h-5 w-5" />
                좋아요
              </button>
              <button className="flex items-center gap-2 px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 font-semibold transition">
                <ThumbsDown className="h-5 w-5" />
              </button>
              <button className="flex items-center gap-2 px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 font-semibold transition">
                <Plus className="h-5 w-5" />
                내가 찜한 콘텐츠
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="text-green-500 font-semibold">
                {video.viewCount.toLocaleString()}회 시청
              </span>
                <span>{formatDate(video.createdAt)}</span>
                {video.ageRating && (
                    <span className="px-2 py-1 border border-gray-600 text-xs">
                  {video.ageRating}
                </span>
                )}
                {video.durationSeconds && (
                    <span>{formatDuration(video.durationSeconds)}</span>
                )}
              </div>

              {video.description && (
                  <p className="text-lg text-gray-300 leading-relaxed">
                    {video.description}
                  </p>
              )}
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">업로더: </span>
                <span className="text-white">
                {video.uploader?.username || video.uploaderName}
              </span>
              </div>
              {video.category && (
                  <div>
                    <span className="text-gray-500">장르: </span>
                    <span className="text-white">{video.category}</span>
                  </div>
              )}
              {video.resolution && (
                  <div>
                    <span className="text-gray-500">화질: </span>
                    <span className="text-white">{video.resolution}</span>
                  </div>
              )}
            </div>
          </div>

          {/* 관련 영상 목록 */}
          {relatedVideos.length > 0 && (
              <div className="mt-16">
                <h2 className="text-2xl font-bold text-white mb-6">
                  비슷한 콘텐츠
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {relatedVideos.map(relatedVideo => (
                      <button
                          key={relatedVideo.id}
                          onClick={() => router.push(`/watch/${relatedVideo.id}`)}
                          className="group text-left"
                      >
                        <div className="relative aspect-video overflow-hidden rounded-md bg-gray-900 mb-3">
                          {relatedVideo.thumbnailUrl ? (
                              <img
                                  src={`http://localhost:8080${relatedVideo.thumbnailUrl}`}
                                  alt={relatedVideo.title}
                                  className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                              />
                          ) : (
                              <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-800 to-gray-900">
                                <Volume2 className="h-12 w-12 text-gray-600" />
                              </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-white group-hover:text-gray-300 transition line-clamp-2 mb-1">
                          {relatedVideo.title}
                        </h3>
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {relatedVideo.description}
                        </p>
                      </button>
                  ))}
                </div>
              </div>
          )}
        </div>
      </div>
  );
}