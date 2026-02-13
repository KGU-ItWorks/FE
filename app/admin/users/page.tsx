'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { 
  Search,
  Shield,
  Ban,
  CheckCircle,
  Loader2
} from 'lucide-react'

interface User {
  id: number
  email: string
  nickname: string
  role: string
  active: boolean
  videoCount: number
  createdAt: string
}

export default function AdminUsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await apiClient.get<any>('/api/v1/admin/users?page=0&size=100')
      setUsers(data.content || [])
    } catch (error) {
      console.error('Failed to load users:', error)
      toast({
        title: '오류',
        description: '사용자 목록을 불러오는데 실패했습니다',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await apiClient.patch(`/api/v1/admin/users/${userId}/role?role=${newRole}`)
      
      toast({
        title: '성공',
        description: '사용자 권한이 변경되었습니다',
      })
      
      loadUsers()
    } catch (error) {
      console.error('Failed to change role:', error)
      toast({
        title: '오류',
        description: '권한 변경 중 오류가 발생했습니다',
        variant: 'destructive',
      })
    }
  }

  const handleStatusToggle = async (userId: number, currentStatus: boolean) => {
    try {
      await apiClient.patch(`/api/v1/admin/users/${userId}/status?active=${!currentStatus}`)
      
      toast({
        title: '성공',
        description: `사용자가 ${!currentStatus ? '활성화' : '비활성화'}되었습니다`,
      })
      
      loadUsers()
    } catch (error) {
      console.error('Failed to toggle status:', error)
      toast({
        title: '오류',
        description: '상태 변경 중 오류가 발생했습니다',
        variant: 'destructive',
      })
    }
  }

  const filteredUsers = users.filter(user =>
    searchQuery === '' ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.nickname?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">사용자 관리</h1>
        <p className="text-muted-foreground">
          모든 사용자의 권한과 상태를 관리할 수 있습니다
          <br />
          <span className="text-xs">* 비활성화된 사용자는 로그인할 수 없습니다</span>
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="이메일 또는 닉네임 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이메일</TableHead>
                <TableHead>닉네임</TableHead>
                <TableHead>권한</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>영상 수</TableHead>
                <TableHead>가입일</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.nickname || '-'}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) => handleRoleChange(user.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ROLE_USER">사용자</SelectItem>
                        <SelectItem value="ROLE_UPLOADER">업로더</SelectItem>
                        <SelectItem value="ROLE_ADMIN">관리자</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {user.active ? (
                      <Badge className="bg-green-500">활성</Badge>
                    ) : (
                      <Badge variant="destructive">비활성</Badge>
                    )}
                  </TableCell>
                  <TableCell>{user.videoCount || 0}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant={user.active ? "destructive" : "default"}
                      onClick={() => handleStatusToggle(user.id, user.active)}
                    >
                      {user.active ? (
                        <>
                          <Ban className="h-4 w-4 mr-1" />
                          비활성화
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          활성화
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {filteredUsers.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">검색 결과가 없습니다</p>
        </div>
      )}
    </div>
  )
}
