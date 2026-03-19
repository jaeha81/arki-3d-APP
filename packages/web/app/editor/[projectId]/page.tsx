// Server Component — required for generateStaticParams with static export
export function generateStaticParams() {
  // Placeholder for static export — actual IDs resolved by client-side routing
  // Capacitor/Tauri apps always start at index.html; navigation is SPA-based
  return [{ projectId: 'new' }]
}

import { EditorPageClient } from './EditorPageClient'

interface EditorPageProps {
  params: Promise<{ projectId: string }>
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { projectId } = await params
  return <EditorPageClient projectId={projectId} />
}
