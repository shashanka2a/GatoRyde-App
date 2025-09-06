import dynamic from 'next/dynamic'

const RidePageClient = dynamic(() => import('./RidePageClient').then(mod => ({ default: mod.RidePageClient })), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-gray-600">Loading ride search...</p>
    </div>
  </div>
})

export default function RidePage() {
  return <RidePageClient />
}