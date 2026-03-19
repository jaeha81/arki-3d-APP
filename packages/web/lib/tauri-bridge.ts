/**
 * Tauri Desktop Bridge
 * Abstracted APIs that work in both Tauri desktop and web browser
 */

export const isTauri = (): boolean => typeof window !== 'undefined' && '__TAURI__' in window

// ─── Persistent Storage ──────────────────────────────────────────────────────

export async function storeGet<T>(key: string): Promise<T | null> {
  if (isTauri()) {
    try {
      const { load } = await import('@tauri-apps/plugin-store')
      const store = await load('settings.json', { autoSave: true })
      return (await store.get<T>(key)) ?? null
    } catch {
      return null
    }
  }
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export async function storeSet<T>(key: string, value: T): Promise<void> {
  if (isTauri()) {
    try {
      const { load } = await import('@tauri-apps/plugin-store')
      const store = await load('settings.json', { autoSave: true })
      await store.set(key, value)
      return
    } catch {
      // fallthrough to localStorage
    }
  }
  localStorage.setItem(key, JSON.stringify(value))
}

export async function storeDelete(key: string): Promise<void> {
  if (isTauri()) {
    try {
      const { load } = await import('@tauri-apps/plugin-store')
      const store = await load('settings.json', { autoSave: true })
      await store.delete(key)
      return
    } catch {}
  }
  localStorage.removeItem(key)
}

// ─── File Save Dialog ─────────────────────────────────────────────────────────

export async function saveFileDialog(
  content: string,
  defaultPath: string,
  mimeType = 'text/plain'
): Promise<void> {
  if (isTauri()) {
    try {
      const { save } = await import('@tauri-apps/plugin-dialog')
      const { writeTextFile } = await import('@tauri-apps/plugin-fs')
      const path = await save({
        defaultPath,
        filters: [{ name: 'Files', extensions: [defaultPath.split('.').pop() ?? 'txt'] }],
      })
      if (path) await writeTextFile(path, content)
      return
    } catch {}
  }
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = defaultPath.split('/').pop() ?? 'file.txt'
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Notifications ─────────────────────────────────────────────────────────────

export async function showNotification(title: string, body: string): Promise<void> {
  if (isTauri()) {
    try {
      const { sendNotification } = await import('@tauri-apps/plugin-notification')
      await sendNotification({ title, body })
      return
    } catch {}
  }
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body })
  }
}

// ─── App Version ──────────────────────────────────────────────────────────────

export async function getAppVersion(): Promise<string> {
  if (isTauri()) {
    try {
      const { getVersion } = await import('@tauri-apps/api/app')
      return await getVersion()
    } catch {
      return '0.1.0'
    }
  }
  return process.env.NEXT_PUBLIC_APP_VERSION ?? '0.1.0'
}
