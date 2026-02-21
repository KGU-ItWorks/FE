'use client'

import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

interface HeroVideoPlayerProps {
  src: string
  poster?: string
}

export function HeroVideoPlayer({ src, poster }: HeroVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // 비디오가 로드되면 자동 재생
    const handleCanPlay = () => {
      video.play().catch(err => {
        console.log('Autoplay prevented:', err)
      })
      setIsPlaying(true)
    }

    video.addEventListener('canplay', handleCanPlay)

    return () => {
      video.removeEventListener('canplay', handleCanPlay)
    }
  }, [])

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted={isMuted}
        loop
        playsInline
        poster={poster}
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* Dark gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />

      {/* Mute/Unmute Button */}
      {isPlaying && (
        <button
          onClick={toggleMute}
          className="absolute bottom-8 right-8 z-20 p-3 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full border-2 border-white/50 transition"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX className="h-6 w-6 text-white" />
          ) : (
            <Volume2 className="h-6 w-6 text-white" />
          )}
        </button>
      )}
    </div>
  )
}
