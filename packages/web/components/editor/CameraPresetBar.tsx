'use client'

import { cn } from '@/lib/utils'
import { useEditorStore } from '@/lib/stores/editor-store'
import type { CameraPreset3D, EnvPreset } from '@/lib/stores/editor-store'

const CAMERA_PRESETS: { value: CameraPreset3D; label: string }[] = [
  { value: 'iso', label: 'Iso' },
  { value: 'top', label: 'Top' },
  { value: 'front', label: 'Front' },
  { value: 'right', label: 'Right' },
]

const ENV_PRESETS: { value: EnvPreset; label: string }[] = [
  { value: 'studio', label: 'Studio' },
  { value: 'forest', label: 'Natural' },
  { value: 'city', label: 'City' },
  { value: 'sunset', label: 'Sunset' },
  { value: 'night', label: 'Night' },
]

export function CameraPresetBar() {
  const cameraPreset3D = useEditorStore(s => s.cameraPreset3D)
  const setCameraPreset3D = useEditorStore(s => s.setCameraPreset3D)
  const envPreset = useEditorStore(s => s.envPreset)
  const setEnvPreset = useEditorStore(s => s.setEnvPreset)
  const showEnvironment = useEditorStore(s => s.showEnvironment)
  const toggleEnvironment = useEditorStore(s => s.toggleEnvironment)

  return (
    <div className="absolute bottom-10 left-3 flex flex-col gap-1.5 z-10">
      {/* Camera view presets */}
      <div className="flex items-center gap-0.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]/90 px-1 py-1 backdrop-blur-sm shadow-sm">
        <span className="px-1.5 text-[9px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
          View
        </span>
        <div className="mx-1 h-4 w-px bg-[hsl(var(--border))]" />
        {CAMERA_PRESETS.map(p => (
          <button
            key={p.value}
            onClick={() => setCameraPreset3D(p.value)}
            className={cn(
              'px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-150',
              cameraPreset3D === p.value
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm'
                : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Environment lighting */}
      <div className="flex items-center gap-0.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]/90 px-1 py-1 backdrop-blur-sm shadow-sm">
        <button
          onClick={toggleEnvironment}
          className={cn(
            'px-2 py-1 text-[9px] font-semibold uppercase tracking-wider rounded-md transition-all duration-150',
            showEnvironment
              ? 'bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))]'
              : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'
          )}
          title="환경 조명 토글"
        >
          ENV
        </button>
        {showEnvironment && (
          <>
            <div className="mx-1 h-4 w-px bg-[hsl(var(--border))]" />
            {ENV_PRESETS.map(e => (
              <button
                key={e.value}
                onClick={() => setEnvPreset(e.value)}
                className={cn(
                  'px-2 py-1 text-xs font-medium rounded-md transition-all duration-150',
                  envPreset === e.value
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm'
                    : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]'
                )}
              >
                {e.label}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
