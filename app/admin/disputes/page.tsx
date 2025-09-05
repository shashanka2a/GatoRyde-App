'use client'

import { useState, useEffect } from 'react'
import { DisputeManager } from '@/src/components/admin/DisputeManager'

export default function AdminDisputesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dispute Management</h1>
        <p className="text-gray-600 mt-2">
          Review and resolve booking disputes between riders and drivers.
        </p>
      </div>

      <DisputeManager />
    </div>
  )
}