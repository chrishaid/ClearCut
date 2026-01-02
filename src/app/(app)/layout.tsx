import { Navbar } from '@/components/layout/Navbar'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16 md:pt-16 pb-8">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>
    </div>
  )
}
