import { DashboardHeader } from '@/components/dashboard/DashboardHeader'

export default function BillingPage() {
  return (
    <>
      <DashboardHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-4">결제 내역</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          결제 내역이 없습니다. 구독을 시작하면 여기에 표시됩니다.
        </p>
      </main>
    </>
  )
}
