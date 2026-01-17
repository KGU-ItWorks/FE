import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Play, Info } from "lucide-react"
import { BrowseHeader } from "@/components/browse-header"
import { ContentRow } from "@/components/content-row"

// Mock data
const TRENDING_NOW = [
  { id: 1, title: "다크 사이드", thumbnail: "/content-thriller-dark.jpg", type: "movie" as const },
  { id: 2, title: "네온 나이트", thumbnail: "/content-scifi-neon.jpg", type: "series" as const },
  { id: 3, title: "레드 존", thumbnail: "/content-action-red.jpg", type: "movie" as const },
  { id: 4, title: "미스터리 하우스", thumbnail: "/content-mystery-house.jpg", type: "series" as const },
  { id: 5, title: "스카이 체이서", thumbnail: "/content-adventure-sky.jpg", type: "movie" as const },
  { id: 6, title: "오션 디프", thumbnail: "/content-ocean-deep.jpg", type: "series" as const },
]

const POPULAR_SERIES = [
  { id: 11, title: "타임 루프", thumbnail: "/content-drama-time.jpg", type: "series" as const },
  { id: 12, title: "퓨처 시티", thumbnail: "/content-future-city.jpg", type: "series" as const },
  { id: 13, title: "섀도우 게임", thumbnail: "/content-shadow-game.jpg", type: "series" as const },
  { id: 14, title: "코스믹 보이지", thumbnail: "/content-cosmic-voyage.jpg", type: "series" as const },
  { id: 15, title: "파이어 윙", thumbnail: "/content-fire-wing.jpg", type: "series" as const },
  { id: 16, title: "스톰 브레이커", thumbnail: "/content-storm-breaker.jpg", type: "series" as const },
]

const NEW_RELEASES = [
  { id: 21, title: "선셋 드라이브", thumbnail: "/content-sunset-drive.jpg", type: "movie" as const },
  { id: 22, title: "크리스털 키", thumbnail: "/content-crystal-key.jpg", type: "movie" as const },
  { id: 23, title: "어번 레전드", thumbnail: "/content-urban-legend.jpg", type: "series" as const },
  { id: 24, title: "에코 스피어", thumbnail: "/content-echo-sphere.jpg", type: "movie" as const },
  { id: 25, title: "그래비티 폴", thumbnail: "/content-gravity-fall.jpg", type: "series" as const },
  { id: 26, title: "나이트 샤인", thumbnail: "/content-night-shine.jpg", type: "movie" as const },
]

const KOREAN_CONTENT = [
  { id: 31, title: "서울 어드벤처", thumbnail: "/content-seoul-adventure.jpg", type: "series" as const },
  { id: 32, title: "한강의 기적", thumbnail: "/content-hangang-miracle.jpg", type: "movie" as const },
  { id: 33, title: "K-히어로", thumbnail: "/content-k-hero.jpg", type: "series" as const },
  { id: 34, title: "타임 트래블러", thumbnail: "/content-time-traveller.jpg", type: "movie" as const },
  { id: 35, title: "사이버 서울", thumbnail: "/content-cyber-seoul.jpg", type: "series" as const },
  { id: 36, title: "레트로 시티", thumbnail: "/content-retro-city.jpg", type: "movie" as const },
]

export default function BrowsePage() {
  return (
    <div className="relative min-h-screen bg-background">
      <BrowseHeader />

      {/* Hero Section */}
      <div className="relative h-[85vh] w-full">
        <div className="absolute inset-0">
          <img src="/hero-featured-content.jpg" alt="Featured content" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
        </div>

        <div className="container relative mx-auto flex h-full items-center px-4 md:px-12">
          <div className="max-w-2xl space-y-6 pt-20">
            <h1 className="text-5xl font-bold leading-tight text-balance md:text-6xl lg:text-7xl">블랙 호라이즌</h1>
            <p className="text-lg leading-relaxed text-foreground/90 md:text-xl">
              전설적인 우주 탐험가가 미지의 행성에서 인류의 운명을 건 마지막 미션을 수행한다. 시간이 얼마 남지 않았다.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/watch/featured">
                <Button size="lg" className="gap-2 bg-foreground text-background hover:bg-foreground/90">
                  <Play className="h-5 w-5" fill="currentColor" />
                  재생
                </Button>
              </Link>
              <Link href="/watch/featured/info">
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2 bg-muted/70 text-foreground backdrop-blur-sm hover:bg-muted"
                >
                  <Info className="h-5 w-5" />
                  상세 정보
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content Rows */}
      <div className="relative -mt-32 space-y-8 pb-16">
        <ContentRow title="지금 뜨는 콘텐츠" items={TRENDING_NOW} />
        <ContentRow title="인기 시리즈" items={POPULAR_SERIES} />
        <ContentRow title="NEW! 신규 콘텐츠" items={NEW_RELEASES} />
        <ContentRow title="한국 콘텐츠" items={KOREAN_CONTENT} />
      </div>
    </div>
  )
}
