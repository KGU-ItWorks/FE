'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { Settings, Database, Mail, Shield } from 'lucide-react'

export default function AdminSettingsPage() {
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: '저장 완료',
      description: '설정이 저장되었습니다',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">설정</h1>
        <p className="text-muted-foreground">시스템 설정을 관리합니다</p>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              일반 설정
            </CardTitle>
            <CardDescription>기본 시스템 설정</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">사이트 이름</Label>
              <Input id="siteName" defaultValue="Streamly" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="siteUrl">사이트 URL</Label>
              <Input id="siteUrl" defaultValue="http://localhost:3000" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>자동 승인</Label>
                <p className="text-sm text-muted-foreground">
                  새 영상을 자동으로 승인합니다
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>회원가입 허용</Label>
                <p className="text-sm text-muted-foreground">
                  새로운 사용자 등록을 허용합니다
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Video Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              영상 설정
            </CardTitle>
            <CardDescription>영상 업로드 및 처리 설정</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maxFileSize">최대 파일 크기 (GB)</Label>
              <Input id="maxFileSize" type="number" defaultValue="5" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="allowedFormats">허용된 파일 형식</Label>
              <Input id="allowedFormats" defaultValue="mp4, avi, mov, mkv" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>HLS 인코딩</Label>
                <p className="text-sm text-muted-foreground">
                  업로드된 영상을 HLS로 변환합니다
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>썸네일 자동 생성</Label>
                <p className="text-sm text-muted-foreground">
                  영상에서 자동으로 썸네일을 생성합니다
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              이메일 설정
            </CardTitle>
            <CardDescription>알림 이메일 설정</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">SMTP 호스트</Label>
              <Input id="smtpHost" placeholder="smtp.gmail.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtpPort">SMTP 포트</Label>
              <Input id="smtpPort" type="number" placeholder="587" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtpUser">SMTP 사용자명</Label>
              <Input id="smtpUser" placeholder="your-email@gmail.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtpPassword">SMTP 비밀번호</Label>
              <Input id="smtpPassword" type="password" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>이메일 알림 활성화</Label>
                <p className="text-sm text-muted-foreground">
                  시스템 이벤트 발생 시 이메일로 알림을 보냅니다
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              보안 설정
            </CardTitle>
            <CardDescription>보안 및 접근 제어 설정</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>2단계 인증</Label>
                <p className="text-sm text-muted-foreground">
                  관리자 로그인 시 2단계 인증을 요구합니다
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>IP 화이트리스트</Label>
                <p className="text-sm text-muted-foreground">
                  특정 IP에서만 관리자 페이지 접근을 허용합니다
                </p>
              </div>
              <Switch />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">세션 타임아웃 (분)</Label>
              <Input id="sessionTimeout" type="number" defaultValue="30" />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button variant="outline">초기화</Button>
          <Button onClick={handleSave}>설정 저장</Button>
        </div>
      </div>
    </div>
  )
}
