"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, Heart } from "lucide-react";
import { favoritesApi, type Video } from "@/lib/api";
import { formatDuration } from "@/lib/format";

interface VideoCardProps {
    video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
    const [isFavorited, setIsFavorited] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();  // prevent navigating to /watch page
        e.stopPropagation();
        if (favoriteLoading) return;
        try {
            setFavoriteLoading(true);
            const result = await favoritesApi.toggle(video.id);
            setIsFavorited(result.favorited);
        } catch (err) {
            console.error("찜 토글 실패:", err);
        } finally {
            setFavoriteLoading(false);
        }
    };

    return (
        <Link href={`/watch/${video.id}`}>
    <div className="group cursor-pointer">
    <div className="relative aspect-video overflow-hidden rounded-md bg-gray-900 mb-2">
        {/* Thumbnail */}
    {video.thumbnailUrl ? (
            <img
                src={video.thumbnailUrl}
        alt={video.title}
        className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-110"
            />
    ) : (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-800 to-gray-900">
        <Play className="h-12 w-12 text-gray-600" />
            </div>
    )}

    {/* Duration badge */}
    {video.durationSeconds && (
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-xs text-white font-semibold">
            {formatDuration(video.durationSeconds)}
        </div>
    )}

    {/* Hover overlay */}
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition duration-300">
    <div className="p-4 bg-white/30 backdrop-blur-sm rounded-full">
    <Play className="h-10 w-10 text-white" fill="currentColor" />
        </div>
        </div>

    {/* Favorite button — always visible, top-right corner */}
    <button
        onClick={handleToggleFavorite}
    disabled={favoriteLoading}
    className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm transition
              ${isFavorited
        ? "bg-red-600/80 text-white"
        : "bg-black/50 text-gray-300 opacity-0 group-hover:opacity-100"
    }`}
>
    <Heart
        className="h-4 w-4"
    fill={isFavorited ? "currentColor" : "none"}
    />
    </button>
    </div>

    <h3 className="font-semibold line-clamp-1 text-white group-hover:text-gray-300 transition text-sm md:text-base">
        {video.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
    <span className="line-clamp-1">{video.uploaderName}</span>
        </div>
        </div>
        </Link>
);
}
