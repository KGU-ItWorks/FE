"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrowseHeader } from "@/components/browse-header";
import { favoritesApi, type FavoritesResponse } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Heart, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/format";

export default function FavoritesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [favorites, setFavorites] = useState<FavoritesResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    }
  }, [isAuthenticated, page]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await favoritesApi.getMyFavorites(page, 20);
      setFavorites(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error("찜 목록 로드 실패:", error);
      toast({
        title: "불러오기 실패",
        description: "찜 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (videoId: number) => {
    try {
      setRemovingId(videoId);
      await favoritesApi.toggle(videoId);
      setFavorites((prev) => prev.filter((f) => f.video.id !== videoId));
      setTotalElements((prev) => prev - 1);
      toast({
        title: "찜 취소",
        description: "찜 목록에서 제거되었습니다.",
      });
    } catch (error) {
      console.error("찜 취소 실패:", error);
      toast({
        title: "오류",
        description: "찜 취소 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setRemovingId(null);
    }
  };

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <BrowseHeader />

      <div className="container mx-auto px-4 py-24 md:px-12">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-4xl font-bold">내가 찜한 콘텐츠</h1>
              {!loading && (
                <p className="mt-1 text-sm text-muted-foreground">
                  총 {totalElements}개의 영상
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>

        /* Empty state */
        ) : favorites.length === 0 ? (
          <div className="rounded-lg border border-border bg-muted/20 p-16 text-center">
            <Heart className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">찜한 콘텐츠가 없습니다</h2>
            <p className="mb-6 text-muted-foreground">
              마음에 드는 영상의 하트를 눌러 찜 목록에 추가해보세요
            </p>
            <Link href="/browse">
              <Button>콘텐츠 둘러보기</Button>
            </Link>
          </div>

        /* List */
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {favorites.map((favorite) => (
                <div key={favorite.favoriteId} className="group relative">
                  <Link href={`/watch/${favorite.video.id}`}>
                    <div className="relative aspect-video overflow-hidden rounded-md bg-gray-900 mb-2">
                      {/* Thumbnail */}
                      {favorite.video.thumbnailUrl ? (
                        <img
                          src={favorite.video.thumbnailUrl}
                          alt={favorite.video.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-800 to-gray-900">
                          <Play className="h-12 w-12 text-gray-600" />
                        </div>
                      )}

                      {/* Duration badge */}
                      {favorite.video.durationSeconds && (
                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-xs text-white font-semibold">
                          {formatDuration(favorite.video.durationSeconds)}
                        </div>
                      )}

                      {/* Play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition duration-300">
                        <div className="p-4 bg-white/30 backdrop-blur-sm rounded-full">
                          <Play className="h-10 w-10 text-white" fill="currentColor" />
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(favorite.video.id)}
                    disabled={removingId === favorite.video.id}
                    className="absolute top-2 left-2 p-1.5 rounded-full bg-black/60 backdrop-blur-sm text-red-400 hover:text-white hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                    title="찜 취소"
                  >
                    {removingId === favorite.video.id
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Heart className="h-4 w-4" fill="currentColor" />
                    }
                  </button>

                  {/* Video info */}
                  <h3 className="font-semibold line-clamp-1 text-white group-hover:text-gray-300 transition text-sm">
                    {favorite.video.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                    {favorite.video.uploaderName}
                  </p>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-8">
                <Button
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  variant="outline"
                >
                  이전
                </Button>
                <div className="flex items-center px-4">
                  <span className="text-sm text-muted-foreground">
                    {page + 1} / {totalPages}
                  </span>
                </div>
                <Button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                  variant="outline"
                >
                  다음
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
