"use client";

import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "videojs-contrib-quality-levels";
import Player from "video.js/dist/types/player";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  onReady?: (player: Player) => void;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
  autoplay?: boolean;
  startTime?: number;
}

export default function VideoPlayer({
                                      src,
                                      poster,
                                      onReady,
                                      onTimeUpdate,
                                      onEnded,
                                      autoplay = false,
                                      startTime = 0
                                    }: VideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 플레이어가 이미 초기화되었는지 확인
    if (!playerRef.current && videoRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered");
      videoRef.current.appendChild(videoElement);

      const player = (playerRef.current = videojs(
          videoElement,
          {
            autoplay: autoplay,
            controls: true,
            responsive: true,
            fluid: true,
            preload: "auto",
            poster: poster,
            liveui: false,
            playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
            controlBar: {
              children: [
                'playToggle',
                'volumePanel',
                'currentTimeDisplay',
                'timeDivider',
                'durationDisplay',
                'progressControl',
                'liveDisplay',
                'seekToLive',
                'remainingTimeDisplay',
                'customControlSpacer',
                'playbackRateMenuButton',
                'chaptersButton',
                'descriptionsButton',
                'subsCapsButton',
                'audioTrackButton',
                'qualitySelector',
                'pictureInPictureToggle',
                'fullscreenToggle'
              ],
              volumePanel: {
                inline: false
              }
            },
            html5: {
              vhs: {
                overrideNative: true,
                enableLowInitialPlaylist: true,
                smoothQualityChange: true,
                fastQualityChange: true
              },
              nativeAudioTracks: false,
              nativeVideoTracks: false
            },
            sources: [
              {
                src: src,
                type: "application/x-mpegURL",
              },
            ],
          },
          () => {
            console.log("Player is ready");
            setIsReady(true);

            if (startTime > 0) {
              player.currentTime(startTime);
            }

            onReady && onReady(player);
          }
      ));

      // 커스텀 이벤트 리스너 - 타입 오류 수정 (|| 0 추가)
      player.on('timeupdate', () => {
        if (onTimeUpdate) {
          onTimeUpdate(player.currentTime() || 0);
        }
      });

      player.on('ended', () => {
        if (onEnded) {
          onEnded();
        }
      });

      // 키보드 단축키 추가 - 타입 안전성 강화
      player.on('keydown', (e: Event) => {
        // Event 타입을 KeyboardEvent로 캐스팅
        const keyEvent = e as unknown as KeyboardEvent;

        // player.currentTime()과 player.duration()의 undefined 체크
        const currentTime = player.currentTime() || 0;
        const duration = player.duration() || 0;

        switch(keyEvent.key) {
          case 'ArrowLeft':
            player.currentTime(Math.max(0, currentTime - 10));
            break;
          case 'ArrowRight':
            player.currentTime(Math.min(duration, currentTime + 10));
            break;
          case ' ':
            if (player.paused()) {
              player.play();
            } else {
              player.pause();
            }
            keyEvent.preventDefault();
            break;
          case 'f':
            if (player.isFullscreen()) {
              player.exitFullscreen();
            } else {
              player.requestFullscreen();
            }
            break;
          case 'm':
            player.muted(!player.muted());
            break;
        }
      });

      // 넷플릭스 스타일 커스텀 CSS
      const style = document.createElement('style');
      style.textContent = `
        .video-js {
          font-family: 'Netflix Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
        }
        .video-js .vjs-big-play-button {
          border: none;
          background-color: rgba(0, 0, 0, 0.45);
          border-radius: 50%;
          width: 80px;
          height: 80px;
          line-height: 80px;
          font-size: 48px;
          transition: all 0.4s;
        }
        .video-js:hover .vjs-big-play-button,
        .video-js .vjs-big-play-button:focus {
          background-color: rgba(229, 9, 20, 0.9);
          border: none;
          transform: scale(1.1);
        }
        .video-js .vjs-control-bar {
          background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 100%);
          height: 4em;
          padding: 0 1em;
        }
        .video-js .vjs-progress-control {
          position: absolute;
          bottom: 3em;
          left: 0;
          right: 0;
          width: 100%;
          height: 0.5em;
        }
        .video-js .vjs-progress-holder {
          height: 0.3em;
          background-color: rgba(255, 255, 255, 0.3);
          transition: height 0.3s;
        }
        .video-js:hover .vjs-progress-holder {
          height: 0.5em;
        }
        .video-js .vjs-play-progress {
          background-color: #E50914;
        }
        .video-js .vjs-play-progress:before {
          font-size: 1em;
          top: -0.35em;
          color: #E50914;
        }
        .video-js .vjs-load-progress {
          background: rgba(255, 255, 255, 0.4);
        }
        .video-js .vjs-slider {
          background-color: transparent;
        }
        .video-js .vjs-volume-level,
        .video-js .vjs-play-progress {
          background-color: #E50914;
        }
        .video-js .vjs-button > .vjs-icon-placeholder:before {
          line-height: 2;
        }
        .video-js .vjs-control:hover {
          color: #E50914;
        }
        .video-js .vjs-menu-button-popup .vjs-menu {
          left: -3em;
          background-color: rgba(0, 0, 0, 0.9);
          border-radius: 4px;
        }
        .video-js .vjs-menu-button-popup .vjs-menu .vjs-menu-content {
          background-color: transparent;
        }
        .video-js .vjs-menu li.vjs-selected,
        .video-js .vjs-menu li.vjs-selected:focus,
        .video-js .vjs-menu li.vjs-selected:hover {
          background-color: #E50914;
          color: white;
        }
        .video-js .vjs-menu li:focus,
        .video-js .vjs-menu li:hover {
          background-color: rgba(229, 9, 20, 0.7);
          color: white;
        }
        .video-js .vjs-loading-spinner {
          border-color: rgba(229, 9, 20, 0.8);
        }
        .video-js .vjs-loading-spinner:before,
        .video-js .vjs-loading-spinner:after {
          border-color: #E50914;
        }
        .video-js .vjs-current-time,
        .video-js .vjs-duration,
        .video-js .vjs-time-divider {
          font-size: 1.2em;
          line-height: 3em;
        }
        @media (max-width: 768px) {
          .video-js .vjs-big-play-button {
            width: 60px;
            height: 60px;
            line-height: 60px;
            font-size: 36px;
          }
          .video-js .vjs-control-bar {
            height: 3em;
          }
          .video-js .vjs-progress-control {
            bottom: 2.5em;
          }
        }
      `;
      document.head.appendChild(style);

    } else if (playerRef.current) {
      const player = playerRef.current;
      player.src({ src, type: "application/x-mpegURL" });

      if (startTime > 0) {
        player.currentTime(startTime);
      }
    }
  }, [src, poster, onReady, autoplay, startTime, onTimeUpdate, onEnded]);

  // 컴포넌트 언마운트 시 플레이어 정리
  useEffect(() => {
    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
      <div data-vjs-player className="w-full">
        <div ref={videoRef} />
      </div>
  );
}