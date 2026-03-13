'use client'

import { useEffect, useRef } from 'react'
import { apiClient } from '@/lib/api/client'
import { useEditorStore } from '@/lib/stores/editor-store'

export function useAutosave(projectId: string) {
  const isDirty = useEditorStore(s => s.isDirty)
  const setDirty = useEditorStore(s => s.setDirty)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isDirty || !projectId || projectId === 'current') return

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      try {
        await apiClient.post(`/projects/${projectId}/versions`, {
          is_autosave: true,
          floor_plan_data: {},
        })
        setDirty(false)
      } catch {
        // autosave failure — silent
      }
    }, 2000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isDirty, projectId, setDirty])
}
