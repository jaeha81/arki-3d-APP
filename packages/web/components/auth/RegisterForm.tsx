'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

export function RegisterForm() {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.')
      return
    }

    setLoading(true)
    try {
      await register({ email, password, name })
    } catch {
      setError('회원가입에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-[hsl(var(--destructive))]/20 bg-[hsl(var(--destructive))]/8 p-3 text-sm text-[hsl(var(--destructive))]">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-sm font-medium">이름</Label>
        <Input
          id="name"
          type="text"
          placeholder="홍길동"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="h-10"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-medium">이메일</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="h-10"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm font-medium">비밀번호</Label>
        <Input
          id="password"
          type="password"
          placeholder="8자 이상"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="h-10"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" className="text-sm font-medium">비밀번호 확인</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="비밀번호를 다시 입력하세요"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
          className="h-10"
        />
      </div>

      <Button type="submit" className="h-10 w-full font-semibold" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        무료로 시작하기
      </Button>

      <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
        가입 시{' '}
        <span className="underline underline-offset-2 cursor-pointer hover:text-[hsl(var(--foreground))]">
          서비스 이용약관
        </span>
        {' '}및{' '}
        <span className="underline underline-offset-2 cursor-pointer hover:text-[hsl(var(--foreground))]">
          개인정보처리방침
        </span>
        에 동의하는 것으로 간주합니다.
      </p>
    </form>
  )
}
