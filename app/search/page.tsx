"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BrowseHeader } from "@/components/browse-header";
import { videoApi, type Video } from "@/lib/api";
import { Play, Search as SearchIcon, Eye } from "lucide-react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    if (query) {
      searchVideos(query);
    }
  }, [query]);

  const searchVideos = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setVideos([]);
      return;
    }

    try {
      setLoading(true);
      const response = await videoApi.getPublishedVideos(0, 100);
      
      // 클라이언트 사이드 검색 (제목, 설명, 업로더 이름)
      const filtered = response.content.filter(video => {
        const q = searchQuery.toLowerCase();
        return (
          video.status === "COMPLETED" &&
          (video.title.toLowerCase().includes(q) ||
           video.description?.toLowerCase().includes(q) ||
           video.uploaderName.toLowerCase().includes(q))
        );
      });
      
      setVideos(filtered);
    } catch (error) {
      console.error("Failed to search videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchInput)}`;
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

  return (
    <div className="min-h-screen bg-background">
      <BrowseHeader />

      <div className="container mx-auto px-4 md:px-12 py-24">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="영상, 업로더 검색..."
              className="w-full px-6 py-4 pr-12 bg-muted rounded-full text-lg focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 hover:bg-muted-foreground/10 rounded-full transition"
            >
              <SearchIcon className="h-5 w-5 text-muted-foreground" />
            </button>
          </form>
        </div>

        {/* Search Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : query ? (
          <>
            <h2 className="text-2xl font-bold mb-6">
              "{query}" 검색 결과 ({videos.length})
            </h2>

            {videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map(video => (
                  <Link key={video.id} href={`/watch/${video.id}`}>
                    <div className="group cursor-pointer">
                      <div className="relative aspect-video overflow-hidden rounded-md bg-muted mb-3">
                        {video.thumbnailUrl ? (
                          <img
                            src={`http://localhost:8080${video.thumbnailUrl}`}
                            alt={video.title}
                            className="h-full w-full object-cover transition group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-800 to-gray-900">
                            <Play className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        
                        {video.durationSeconds && (
                          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-xs text-white">
                            {formatDuration(video.durationSeconds)}
                          </div>
                        )}

                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                            <Play className="h-8 w-8 text-white" fill="currentColor" />
                          </div>
                        </div>
                      </div>

                      <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition">
                        {video.title}
                      </h3>
                      
                      {video.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {video.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{video.uploaderName}</span>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{video.viewCount.toLocaleString()}</span>
                        </div>
                        {video.category && (
                          <span className="px-2 py-0.5 bg-muted rounded">
                            {video.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  검색 결과가 없습니다
                </h3>
                <p className="text-muted-foreground">
                  다른 키워드로 검색해보세요
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              검색어를 입력하세요
            </h3>
            <p className="text-muted-foreground">
              영상 제목, 설명, 업로더 이름으로 검색할 수 있습니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
