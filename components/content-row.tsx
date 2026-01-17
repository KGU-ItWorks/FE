"use client"

import { useRef } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ContentItem {
  id: number
  title: string
  thumbnail: string
  type: "movie" | "series"
}

interface ContentRowProps {
  title: string
  items: ContentItem[]
}

export function ContentRow({ title, items }: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -800 : 800
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <div className="group relative mb-8">
      <h2 className="mb-4 px-4 text-xl font-semibold text-foreground md:px-12 md:text-2xl">{title}</h2>

      <div className="relative">
        {/* Left Arrow */}
        <Button
          onClick={() => scroll("left")}
          variant="ghost"
          size="icon"
          className="absolute left-0 top-0 z-10 h-full w-12 rounded-none bg-black/50 opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100 md:w-16"
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>

        {/* Content Scroll Container */}
        <div
          ref={scrollRef}
          className="scrollbar-thin flex gap-2 overflow-x-auto px-4 md:gap-3 md:px-12"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/watch/${item.id}`}
              className="group/item relative flex-shrink-0 transition-transform duration-300 hover:scale-105 hover:z-10"
            >
              <div className="relative h-36 w-64 overflow-hidden rounded-md md:h-44 md:w-80">
                <img
                  src={item.thumbnail || "/placeholder.svg"}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity group-hover/item:opacity-100" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 transition-all group-hover/item:translate-y-0 group-hover/item:opacity-100">
                  <h3 className="text-sm font-semibold text-foreground md:text-base">{item.title}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Right Arrow */}
        <Button
          onClick={() => scroll("right")}
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 z-10 h-full w-12 rounded-none bg-black/50 opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100 md:w-16"
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </div>
    </div>
  )
}
