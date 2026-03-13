'use client'

import React from 'react'
import { Button } from './button'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}
interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
            <h2 className="text-lg font-semibold">문제가 발생했습니다</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {this.state.error?.message ?? '알 수 없는 오류'}
            </p>
            <Button
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              다시 시도
            </Button>
          </div>
        )
      )
    }
    return this.props.children
  }
}
