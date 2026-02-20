"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { BrowseHeader } from "@/components/browse-header";
import { videoApi, type Video } from "@/lib/api";
import { getCategoryBySlug } from "@/lib/categories";
import { Play, Clock, Eye, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const categorySlug = resolvedParams.slug; // 영어 slug (series, movies, all 등)
  const router = useRouter();

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  // slug로 카테고리 정보 가져오기
  const category = getCategoryBySlug(categorySlug);
  const categoryName = category?.name || categorySlug;
  const categoryApiValue = category?.apiValue || categorySlug;

  useEffect(() => {
    loadVideos();
  }, [categorySlug]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const response = await videoApi.getPublishedVideos(0, 50);

      // 카테고리 필터링
      let filtered = response.content.filter(v => v.status === "COMPLETED");

      // "전체" 카테고리가 아니면 필터링
      if (categoryApiValue !== "전체") {
        filtered = filtered.filter(v => v.category === categoryApiValue);
      }
      
      setVideos(filtered);
    } catch (error) {
      console.error("Failed to load videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <BrowseHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BrowseHeader />

      <div className="container mx-auto px-4 md:px-12 py-24">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            뒤로 가기
          </button>
          
          <h1 className="text-4xl font-bold mb-2">{categoryName}</h1>
          <p className="text-muted-foreground">
            {videos.length}개의 영상
          </p>
        </div>

        {/* Videos Grid */}
        {videos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {videos.map(video => (
              <Link key={video.id} href={`/watch/${video.id}`}>
                <div className="group cursor-pointer">
                  <div className="relative aspect-video overflow-hidden rounded-md bg-muted mb-3">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-800 to-gray-900">
                        <Play className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Duration Badge */}
                    {video.durationSeconds && (
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-xs text-white">
                        {formatDuration(video.durationSeconds)}
                      </div>
                    )}

                    {/* Hover Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                        <Play className="h-8 w-8 text-white" fill="currentColor" />
                      </div>
                    </div>
                  </div>

                  <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition">
                    {video.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {video.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{video.uploaderName}</span>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{video.viewCount.toLocaleString()}</span>
                    </div>
                    {video.ageRating && (
                      <span className="px-2 py-0.5 bg-muted rounded">
                        {video.ageRating}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">
              이 카테고리에는 영상이 없습니다
            </h2>
            <p className="text-muted-foreground mb-6">
              다른 카테고리를 둘러보세요!
            </p>
            <Link href="/browse">
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-semibold">
                홈으로 돌아가기
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
