// Server Component — required for generateStaticParams with static export
export function generateStaticParams() {
  // Placeholder for static export — tokens are dynamic at runtime
  return [{ token: 'preview' }]
}

import { SharePageClient } from './SharePageClient'

interface SharePageProps {
  params: Promise<{ token: string }>
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params
  return <SharePageClient token={token} />
}
