'use client'

import { useState } from 'react'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { MapPin } from 'lucide-react'

interface SimpleLocationInputProps {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  className?: string
}

export function SimpleLocationInput({
  label,
  placeholder,
  value,
  onChange,
  className
}: SimpleLocationInputProps) {
  return (
    <div className={className}>
      <Label htmlFor={`location-${label}`} className="flex items-center gap-2 text-sm font-medium mb-2">
        <MapPin className="w-4 h-4" />
        {label}
      </Label>
      <Input
        id={`location-${label}`}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
      />
    </div>
  )
}