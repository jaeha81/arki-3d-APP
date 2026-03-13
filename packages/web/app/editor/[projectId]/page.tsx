'use client'

import { use } from 'react'
import { EditorLayout } from '@/components/editor/EditorLayout'

interface EditorPageProps {
  params: Promise<{ projectId: string }>
}

export default function EditorPage({ params }: EditorPageProps) {
  const { projectId } = use(params)

  return <EditorLayout projectId={projectId} />
}
