/**
 * 카테고리 매핑 (URL slug <-> 한글 이름)
 */

export interface Category {
  slug: string      // URL에 사용되는 영어 슬러그
  name: string      // 화면에 표시되는 한글 이름
  apiValue: string  // 백엔드 API에 전달되는 값
}

export const CATEGORIES: Category[] = [
  {
    slug: 'all',
    name: '전체',
    apiValue: '전체'
  },
  {
    slug: 'series',
    name: '시리즈',
    apiValue: '시리즈'
  },
  {
    slug: 'movies',
    name: '영화',
    apiValue: '영화'
  },
  {
    slug: 'comedy',
    name: '컴투 대기',
    apiValue: '컴투 대기'
  },
  {
    slug: 'sf',
    name: 'SF',
    apiValue: 'SF'
  }
]

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find(cat => cat.slug === slug)
}

export function getCategoryByApiValue(apiValue: string): Category | undefined {
  return CATEGORIES.find(cat => cat.apiValue === apiValue)
}
