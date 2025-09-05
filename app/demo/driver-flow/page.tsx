'use client'

import { DriverFlowDemo } from '@/src/components/rides/DriverFlowDemo'

export default function DriverFlowDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50">
      <div className="container mx-auto py-12 px-4">
        <DriverFlowDemo />
      </div>
    </div>
  )
}