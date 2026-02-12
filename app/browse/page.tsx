"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrowseHeader } from "@/components/browse-header";
import { videoApi, type Video } from "@/lib/api";
import { Play, Info, Clock, Eye } from "lucide-react";

export default function BrowsePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredVideo, setFeaturedVideo] = useState<Video | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching videos from API...");
      
      const response = await videoApi.getPublishedVideos(0, 20);
      console.log("✅ API Response:", response);
      console.log("📊 Total videos:", response.content.length);
      
      // 모든 영상 로그
      response.content.forEach((v, idx) => {
        console.log(`Video ${idx + 1}:`, {
          id: v.id,
          title: v.title,
          status: v.status,
          approvalStatus: v.approvalStatus
        });
      });

      setVideos(response.content);

      // 첫 번째 완료된 영상을 Featured로 설정 (대소문자 무시)
      const completed = response.content.find(v =>
        v.status && v.status.toUpperCase() === "COMPLETED"
      );

      if (completed) {
        console.log("🎬 Featured video:", completed.title);
        setFeaturedVideo(completed);
      } else {
        console.warn("⚠️ No completed videos found");
        console.log("Available statuses:", response.content.map(v => v.status));

        // 완료된 영상이 없으면 첫 번째 영상을 Featured로 설정
        if (response.content.length > 0) {
          console.log("Using first video as featured:", response.content[0].title);
          setFeaturedVideo(response.content[0]);
        }
      }
    } catch (error) {
      console.error("❌ Failed to load videos:", error);
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

  const getCategoryVideos = (category: string) => {
    return videos.filter(v => {
      // 상태 체크 (대소문자 무시)
      const isCompleted = v.status && v.status.toUpperCase() === "COMPLETED";
      
      // 카테고리 체크
      const matchesCategory = v.category === category;
      
      return isCompleted && matchesCategory;
    }).slice(0, 6);
  };

  // 모든 완료된 영상 (대소문자 무시)
  const allCompletedVideos = videos.filter(v => 
    v.status && v.status.toUpperCase() === "COMPLETED"
  );

  const categories = [
    { name: "전체", slug: "전체", videos: videos.slice(0, 12) }, // 모든 영상
    { name: "시리즈", slug: "시리즈", videos: getCategoryVideos("시리즈") },
    { name: "영화", slug: "영화", videos: getCategoryVideos("영화") },
    { name: "컴투 대기", slug: "컴투 대기", videos: getCategoryVideos("컴투 대기") },
    { name: "SF", slug: "SF", videos: getCategoryVideos("SF") },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <BrowseHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black">
      <BrowseHeader />

      {/* Hero Section - Featured Video */}
      {featuredVideo && (
        <div className="relative h-screen w-full">
          {/* Background Image with Gradient */}
          <div className="absolute inset-0">
            {featuredVideo.thumbnailUrl ? (
              <img
                src={`http://localhost:8080${featuredVideo.thumbnailUrl}`}
                alt={featuredVideo.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-gray-800 to-gray-900" />
            )}
            {/* Dark gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-4 md:px-12 pb-32">
              <div className="max-w-2xl space-y-6">
                <h1 className="text-5xl font-bold leading-tight md:text-6xl lg:text-7xl text-white drop-shadow-lg">
                  {featuredVideo.title}
                </h1>
                
                {featuredVideo.description && (
                  <p className="text-lg leading-relaxed text-white/90 md:text-xl line-clamp-3 drop-shadow-md">
                    {featuredVideo.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-white/80">
                  {featuredVideo.durationSeconds && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(featuredVideo.durationSeconds)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{featuredVideo.viewCount.toLocaleString()}회</span>
                  </div>
                  {featuredVideo.ageRating && (
                    <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs font-semibold">
                      {featuredVideo.ageRating}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <Link href={`/watch/${featuredVideo.id}`}>
                    <button className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded hover:bg-white/90 font-semibold text-lg transition shadow-lg">
                      <Play className="h-6 w-6" fill="currentColor" />
                      재생
                    </button>
                  </Link>
                  <Link href={`/my-videos/${featuredVideo.id}`}>
                    <button className="flex items-center gap-2 px-8 py-3 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded font-semibold text-lg transition">
                      <Info className="h-6 w-6" />
                      상세 정보
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Rows by Category */}
      <div className="relative bg-black pb-16">
        {categories.map((category, index) => {
          if (category.videos.length === 0) return null;

          return (
            <div key={category.slug} className={index === 0 ? "-mt-32 relative z-10" : "mt-12"}>
              <div className="container mx-auto px-4 md:px-12">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">{category.name}</h2>
                  <Link 
                    href={`/category/${category.slug}`}
                    className="text-sm text-gray-400 hover:text-white transition"
                  >
                    모두 보기 →
                  </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 md:gap-4">
                  {category.videos.map(video => (
                    <Link key={video.id} href={`/watch/${video.id}`}>
                      <div className="group cursor-pointer">
                        <div className="relative aspect-video overflow-hidden rounded-md bg-gray-900 mb-2">
                          {video.thumbnailUrl ? (
                            <img
                              src={`http://localhost:8080${video.thumbnailUrl}`}
                              alt={video.title}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-800 to-gray-900">
                              <Play className="h-12 w-12 text-gray-600" />
                            </div>
                          )}
                          
                          {/* Duration Badge */}
                          {video.durationSeconds && (
                            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-xs text-white font-semibold">
                              {formatDuration(video.durationSeconds)}
                            </div>
                          )}

                          {/* Hover Play Button */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition duration-300">
                            <div className="p-4 bg-white/30 backdrop-blur-sm rounded-full">
                              <Play className="h-10 w-10 text-white" fill="currentColor" />
                            </div>
                          </div>
                        </div>

                        <h3 className="font-semibold line-clamp-1 text-white group-hover:text-gray-300 transition text-sm md:text-base">
                          {video.title}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                          <span className="line-clamp-1">{video.uploaderName}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {/* 영상이 없을 때 */}
        {videos.length === 0 && (
          <div className="container mx-auto px-4 md:px-12 py-20 text-center">
            <h2 className="text-2xl font-bold mb-4 text-white">아직 업로드된 영상이 없습니다</h2>
            <p className="text-gray-400 mb-6">
              첫 번째 영상을 업로드해보세요!
            </p>
            <Link href="/upload">
              <button className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 font-semibold">
                영상 업로드하기
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
