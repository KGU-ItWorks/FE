const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

type Role = "ROLE_USER" | "ROLE_ADMIN" | "ROLE_UPLOADER"

export interface User {
  id: number
  email: string
  nickname: string
  role: Role
  provider?: string
  createdAt: string
}

export interface Video {
  id: number
  title: string
  description: string
  uploaderName: string
  uploaderId: number
  uploader?: {
    id: number
    username: string
  }
  originalFilename: string
  originalFileSize: number
  cloudfrontUrl: string | null
  s3Url: string | null
  thumbnailUrl: string | null
  durationSeconds: number | null
  resolution: string | null
  videoCodec: string | null
  audioCodec: string | null
  status: "UPLOADING" | "UPLOADED" | "ENCODING" | "COMPLETED" | "FAILED" | "DELETED"
  encodingProgress: number
  viewCount: number
  category: string
  ageRating: string
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED"
  rejectionReason: string | null
  createdAt: string
  publishedAt: string | null
}

export interface VideoUploadData {
  title: string
  description?: string
  category?: string
  ageRating?: string
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const defaultOptions: RequestInit = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest", // CSRF 보호
      ...options.headers,
    },
  }

  const response = await fetch(url, { ...defaultOptions, ...options })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `API 요청 실패: ${response.status}`)
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}

export const userApi = {
  getCurrentUser: () => apiRequest<User>("/api/v1/users/me"),

  updateUser: (data: { nickname?: string }) =>
    apiRequest<User>("/api/v1/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
}

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{
      email: string
      nickname: string
      role: Role
      message: string
    }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  signup: (email: string, password: string, name: string) =>
    apiRequest<string>("/api/v1/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),

  logout: () =>
    apiRequest<string>("/api/v1/auth/logout", {
      method: "POST",
    }),
}

export const videoApi = {
  /**
   * 영상 업로드 (파일 + 메타데이터)
   */
  uploadVideo: async (
    videoFile: File,
    data: VideoUploadData,
    thumbnailFile?: File | null,
    onProgress?: (progress: number) => void
  ): Promise<Video> => {
    const formData = new FormData()

    // 영상 파일
    formData.append("file", videoFile)

    // 메타데이터
    formData.append("title", data.title)
    if (data.description) formData.append("description", data.description)
    if (data.category) formData.append("category", data.category)
    if (data.ageRating) formData.append("ageRating", data.ageRating)

    // 썸네일 (옵션)
    if (thumbnailFile) {
      formData.append("thumbnailFile", thumbnailFile)
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      // 진행률 추적
      if (onProgress) {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100
            onProgress(percentComplete)
          }
        })
      }

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            resolve(response)
          } catch (error) {
            reject(new Error("응답 파싱 실패"))
          }
        } else {
          reject(new Error(`업로드 실패: ${xhr.status} ${xhr.statusText}`))
        }
      })

      xhr.addEventListener("error", () => {
        reject(new Error("네트워크 오류"))
      })

      xhr.addEventListener("abort", () => {
        reject(new Error("업로드 취소됨"))
      })

      xhr.open("POST", `${API_BASE_URL}/api/v1/videos/upload`)
      xhr.withCredentials = true
      
      // CSRF 보호를 위한 커스텀 헤더 추가
      xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest")
      
      xhr.send(formData)
    })
  },

  /**
   * 영상 상태 조회
   */
  getVideoStatus: (videoId: number) =>
    apiRequest<Video>(`/api/v1/videos/${videoId}/status`),

  /**
   * 영상 상세 조회
   */
  getVideoById: (videoId: number) =>
    apiRequest<Video>(`/api/v1/videos/${videoId}`),

  /**
   * 공개 영상 목록 조회
   */
  getPublishedVideos: (page: number = 0, size: number = 20) =>
    apiRequest<{ content: Video[]; totalPages: number; totalElements: number }>(
      `/api/v1/videos?page=${page}&size=${size}`
    ),

  /**
   * 내가 업로드한 영상 목록
   */
  getMyVideos: (page: number = 0, size: number = 20) =>
    apiRequest<{ content: Video[]; totalPages: number; totalElements: number }>(
      `/api/v1/videos/my?page=${page}&size=${size}`
    ),
}
