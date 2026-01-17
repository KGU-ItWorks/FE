"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { BrowseHeader } from "@/components/browse-header"
import { Search } from "lucide-react"
import Link from "next/link"

const MOCK_RESULTS = [
  { id: 1, title: "다크 사이드", thumbnail: "/content-thriller-dark.jpg", type: "movie", year: 2026, rating: 4.5 },
  { id: 2, title: "네온 나이트", thumbnail: "/content-scifi-neon.jpg", type: "series", year: 2025, rating: 4.8 },
  { id: 3, title: "레드 존", thumbnail: "/content-action-red.jpg", type: "movie", year: 2026, rating: 4.3 },
  {
    id: 4,
    title: "미스터리 하우스",
    thumbnail: "/content-mystery-house.jpg",
    type: "series",
    year: 2025,
    rating: 4.6,
  },
  {
    id: 5,
    title: "스카이 체이서",
    thumbnail: "/content-adventure-sky.jpg",
    type: "movie",
    year: 2026,
    rating: 4.4,
  },
  { id: 6, title: "오션 디프", thumbnail: "/content-ocean-deep.jpg", type: "series", year: 2025, rating: 4.7 },
  { id: 7, title: "블랙 호라이즌", thumbnail: "/watch-hero-background.jpg", type: "movie", year: 2026, rating: 4.8 },
  { id: 8, title: "타임 루프", thumbnail: "/content-drama-time.jpg", type: "series", year: 2025, rating: 4.5 },
]

const TRENDING_SEARCHES = ["SF", "액션", "스릴러", "로맨스", "코미디", "애니메이션"]

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredResults, setFilteredResults] = useState(MOCK_RESULTS)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim() === "") {
      setFilteredResults(MOCK_RESULTS)
    } else {
      const filtered = MOCK_RESULTS.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
      setFilteredResults(filtered)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <BrowseHeader />

      <div className="container mx-auto px-4 py-24 md:px-12">
        {/* Search Bar */}
        <div className="mx-auto mb-12 max-w-3xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="제목, 장르, 배우로 검색하세요..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-14 pl-12 text-lg"
            />
          </div>
        </div>

        {/* Trending Searches */}
        {searchQuery === "" && (
          <div className="mb-12">
            <h2 className="mb-4 text-xl font-semibold">인기 검색어</h2>
            <div className="flex flex-wrap gap-2">
              {TRENDING_SEARCHES.map((term) => (
                <Badge
                  key={term}
                  variant="secondary"
                  className="cursor-pointer bg-secondary/50 hover:bg-secondary"
                  onClick={() => handleSearch(term)}
                >
                  {term}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        <div>
          <h2 className="mb-6 text-2xl font-semibold">
            {searchQuery ? `"${searchQuery}" 검색 결과 (${filteredResults.length})` : "전체 콘텐츠"}
          </h2>

          {filteredResults.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-xl text-muted-foreground">검색 결과가 없습니다.</p>
              <p className="mt-2 text-sm text-muted-foreground">다른 키워드로 검색해보세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredResults.map((item) => (
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
          )}
        </div>
      </div>
    </div>
  )
}
