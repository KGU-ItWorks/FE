import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Plus, ThumbsUp, ThumbsDown, Share2, ChevronLeft, Star, Clock, Calendar } from "lucide-react"
import { BrowseHeader } from "@/components/browse-header"
import { ContentRow } from "@/components/content-row"

// Mock similar content
const SIMILAR_CONTENT = [
  { id: 101, title: "스페이스 오딧세이", thumbnail: "/similar-1.jpg", type: "movie" as const },
  { id: 102, title: "딥 스페이스", thumbnail: "/similar-2.jpg", type: "series" as const },
  { id: 103, title: "갤럭시 워", thumbnail: "/similar-3.jpg", type: "movie" as const },
  { id: 104, title: "코스믹 히어로", thumbnail: "/similar-4.jpg", type: "series" as const },
  { id: 105, title: "스타 체이서", thumbnail: "/similar-5.jpg", type: "movie" as const },
  { id: 106, title: "보이드 런너", thumbnail: "/similar-6.jpg", type: "series" as const },
]

const REVIEWS = [
  {
    id: 1,
    author: "김영희",
    rating: 5,
    date: "2026-01-10",
    content: "정말 놀라운 영상미와 스토리! SF 팬이라면 꼭 봐야 할 작품입니다.",
  },
  {
    id: 2,
    author: "이철수",
    rating: 4,
    date: "2026-01-08",
    content: "전개가 조금 느리지만 후반부는 정말 압권입니다. 연기도 훌륭해요.",
  },
  {
    id: 3,
    author: "박지민",
    rating: 5,
    date: "2026-01-05",
    content: "크리스토퍼 놀란 감독의 최고 작품 중 하나. 반전이 정말 충격적이었습니다!",
  },
]

export default function WatchPage({ params }: { params: { id: string } }) {
  // Mock content data - will be fetched from backend later
  const content = {
    id: params.id,
    title: "블랙 호라이즌",
    year: 2026,
    rating: "15+",
    duration: "2시간 18분",
    genre: ["SF", "스릴러", "액션"],
    match: "98% 일치",
    userRating: 4.8,
    totalReviews: 1523,
    releaseDate: "2026-01-01",
    description:
      "전설적인 우주 탐험가가 미지의 행성에서 인류의 운명을 건 마지막 미션을 수행한다. 시간이 얼마 남지 않았다. 우주의 끝에서 발견한 진실이 인류의 미래를 바꿀 것인가?",
    cast: ["존 도우", "제인 스미스", "마이클 존슨", "에밀리 데이비스"],
    director: "크리스토퍼 놀란",
    writer: "조나단 놀란",
    studio: "워너 브라더스",
    language: "영어, 한국어",
    subtitle: "한국어, 영어, 일본어",
  }

  return (
    <div className="relative min-h-screen bg-background">
      <BrowseHeader />

      {/* Hero Section with Video Player Area */}
      <div className="relative h-[80vh] w-full">
        <div className="absolute inset-0">
          <img src="/watch-hero-background.jpg" alt={content.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
        </div>

        <div className="container relative mx-auto flex h-full flex-col justify-between px-4 pt-24 pb-12 md:px-12">
          {/* Back Button */}
          <Link href="/browse">
            <Button variant="ghost" className="gap-2 text-foreground hover:text-foreground/80">
              <ChevronLeft className="h-5 w-5" />
              뒤로가기
            </Button>
          </Link>

          {/* Title and Actions */}
          <div className="max-w-3xl space-y-6">
            <h1 className="text-5xl font-bold text-balance md:text-6xl lg:text-7xl">{content.title}</h1>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                <span className="text-lg font-semibold">{content.userRating}</span>
                <span className="text-sm text-muted-foreground">({content.totalReviews.toLocaleString()} 리뷰)</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" className="gap-2 bg-foreground text-background hover:bg-foreground/90">
                <Play className="h-5 w-5" fill="currentColor" />
                재생
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-muted bg-muted/30 backdrop-blur-sm hover:bg-muted/50"
              >
                <Plus className="h-5 w-5" />
                내가 찜한 콘텐츠
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="border-muted bg-muted/30 backdrop-blur-sm hover:bg-muted/50"
              >
                <ThumbsUp className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="border-muted bg-muted/30 backdrop-blur-sm hover:bg-muted/50"
              >
                <ThumbsDown className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="border-muted bg-muted/30 backdrop-blur-sm hover:bg-muted/50"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Details */}
      <div className="container mx-auto px-4 py-12 md:px-12">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                {content.match}
              </Badge>
              <span className="text-muted-foreground">{content.year}</span>
              <Badge variant="outline" className="border-muted-foreground/30">
                {content.rating}
              </Badge>
              <span className="text-muted-foreground">{content.duration}</span>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <p className="text-lg leading-relaxed text-foreground/90">{content.description}</p>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {content.genre.map((g) => (
                <Badge key={g} variant="secondary" className="bg-secondary/50">
                  {g}
                </Badge>
              ))}
            </div>

            {/* Episodes Section (for series) */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">에피소드</h2>
              <div className="space-y-3">
                {[1, 2, 3].map((ep) => (
                  <div
                    key={ep}
                    className="flex gap-4 rounded-md bg-muted/30 p-4 transition-colors hover:bg-muted/50 cursor-pointer"
                  >
                    <div className="relative h-24 w-40 flex-shrink-0 overflow-hidden rounded-md">
                      <img src={`/episode-${ep}.jpg`} alt={`Episode ${ep}`} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Play className="h-8 w-8" fill="currentColor" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">
                          {ep}. 에피소드 {ep}
                        </h3>
                        <span className="text-sm text-muted-foreground">52분</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        우주 탐험가가 미지의 행성에 도착하여 놀라운 발견을 하게 된다.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">사용자 리뷰</h2>
              <div className="space-y-4">
                {REVIEWS.map((review) => (
                  <div key={review.id} className="rounded-lg border border-border bg-muted/20 p-6">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 font-semibold text-primary">
                          {review.author.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold">{review.author}</div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-muted"}`}
                                />
                              ))}
                            </div>
                            <span>{review.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="leading-relaxed text-foreground/90">{review.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-muted/20 p-6">
              <h3 className="mb-4 text-lg font-semibold">상세 정보</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">개봉일</div>
                    <div className="font-medium">{content.releaseDate}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">러닝타임</div>
                    <div className="font-medium">{content.duration}</div>
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground">출연: </span>
                  <span className="text-foreground">{content.cast.join(", ")}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">감독: </span>
                  <span className="text-foreground">{content.director}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">각본: </span>
                  <span className="text-foreground">{content.writer}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">제작사: </span>
                  <span className="text-foreground">{content.studio}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">언어: </span>
                  <span className="text-foreground">{content.language}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">자막: </span>
                  <span className="text-foreground">{content.subtitle}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Content */}
        <div className="mt-16">
          <ContentRow title="비슷한 콘텐츠" items={SIMILAR_CONTENT} />
        </div>
      </div>
    </div>
  )
}
