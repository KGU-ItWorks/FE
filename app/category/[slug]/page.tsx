import { Badge } from "@/components/ui/badge"
import { BrowseHeader } from "@/components/browse-header"
import Link from "next/link"

const CATEGORY_DATA: Record<
  string,
  {
    title: string
    description: string
    items: Array<{
      id: number
      title: string
      thumbnail: string
      type: "movie" | "series"
      year: number
      rating: number
    }>
  }
> = {
  movie: {
    title: "영화",
    description: "엄선된 최고의 영화 컬렉션",
    items: [
      { id: 1, title: "다크 사이드", thumbnail: "/content-thriller-dark.jpg", type: "movie", year: 2026, rating: 4.5 },
      { id: 3, title: "레드 존", thumbnail: "/content-action-red.jpg", type: "movie", year: 2026, rating: 4.3 },
      {
        id: 5,
        title: "스카이 체이서",
        thumbnail: "/content-adventure-sky.jpg",
        type: "movie",
        year: 2026,
        rating: 4.4,
      },
      {
        id: 7,
        title: "블랙 호라이즌",
        thumbnail: "/watch-hero-background.jpg",
        type: "movie",
        year: 2026,
        rating: 4.8,
      },
      {
        id: 21,
        title: "선셋 드라이브",
        thumbnail: "/content-sunset-drive.jpg",
        type: "movie",
        year: 2026,
        rating: 4.6,
      },
      {
        id: 22,
        title: "크리스털 키",
        thumbnail: "/content-crystal-key.jpg",
        type: "movie",
        year: 2026,
        rating: 4.5,
      },
    ],
  },
  series: {
    title: "시리즈",
    description: "몰입도 높은 시리즈 콘텐츠",
    items: [
      { id: 2, title: "네온 나이트", thumbnail: "/content-scifi-neon.jpg", type: "series", year: 2025, rating: 4.8 },
      {
        id: 4,
        title: "미스터리 하우스",
        thumbnail: "/content-mystery-house.jpg",
        type: "series",
        year: 2025,
        rating: 4.6,
      },
      { id: 6, title: "오션 디프", thumbnail: "/content-ocean-deep.jpg", type: "series", year: 2025, rating: 4.7 },
      { id: 8, title: "타임 루프", thumbnail: "/content-drama-time.jpg", type: "series", year: 2025, rating: 4.5 },
      {
        id: 11,
        title: "퓨처 시티",
        thumbnail: "/content-future-city.jpg",
        type: "series",
        year: 2025,
        rating: 4.7,
      },
      {
        id: 12,
        title: "섀도우 게임",
        thumbnail: "/content-shadow-game.jpg",
        type: "series",
        year: 2025,
        rating: 4.6,
      },
    ],
  },
  korean: {
    title: "한국 콘텐츠",
    description: "국내 최고의 작품들",
    items: [
      {
        id: 31,
        title: "서울 어드벤처",
        thumbnail: "/content-seoul-adventure.jpg",
        type: "series",
        year: 2026,
        rating: 4.7,
      },
      {
        id: 32,
        title: "한강의 기적",
        thumbnail: "/content-hangang-miracle.jpg",
        type: "movie",
        year: 2026,
        rating: 4.8,
      },
      { id: 33, title: "K-히어로", thumbnail: "/content-k-hero.jpg", type: "series", year: 2026, rating: 4.6 },
      {
        id: 34,
        title: "타임 트래블러",
        thumbnail: "/content-time-traveller.jpg",
        type: "movie",
        year: 2026,
        rating: 4.5,
      },
      {
        id: 35,
        title: "사이버 서울",
        thumbnail: "/content-cyber-seoul.jpg",
        type: "series",
        year: 2026,
        rating: 4.9,
      },
      {
        id: 36,
        title: "레트로 시티",
        thumbnail: "/content-retro-city.jpg",
        type: "movie",
        year: 2026,
        rating: 4.4,
      },
    ],
  },
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const category = CATEGORY_DATA[params.slug] || CATEGORY_DATA.movie

  return (
    <div className="min-h-screen bg-background">
      <BrowseHeader />

      <div className="container mx-auto px-4 py-24 md:px-12">
        {/* Category Header */}
        <div className="mb-12">
          <h1 className="mb-2 text-4xl font-bold md:text-5xl">{category.title}</h1>
          <p className="text-lg text-muted-foreground">{category.description}</p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {category.items.map((item) => (
            <Link key={item.id} href={`/watch/${item.id}`} className="group">
              <div className="overflow-hidden rounded-md transition-transform duration-300 hover:scale-105">
                <div className="relative aspect-[2/3]">
                  <img
                    src={item.thumbnail || "/placeholder.svg"}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                    <h3 className="mb-1 font-semibold text-white">{item.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-white/80">
                      <Badge variant="secondary" className="bg-white/20 text-white">
                        {item.type === "movie" ? "영화" : "시리즈"}
                      </Badge>
                      <span>{item.year}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
