'use client'

import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  primaryAction?: {
    label: string
    href: string
    icon?: LucideIcon
  }
  secondaryAction?: {
    label: string
    href: string
    icon?: LucideIcon
  }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center py-16 ${className}`}
    >
      <div className="max-w-md mx-auto">
        <div className="bg-gradient-to-br from-teal-100 to-emerald-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <Icon className="w-12 h-12 text-teal-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 mb-8">{description}</p>
        
        <div className="space-y-3">
          {primaryAction && (
            <Button
              asChild
              size="lg"
              className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
            >
              <Link href={primaryAction.href}>
                {primaryAction.icon && <primaryAction.icon className="w-5 h-5 mr-2" />}
                {primaryAction.label}
              </Link>
            </Button>
          )}
          
          {secondaryAction && (
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href={secondaryAction.href}>
                {secondaryAction.icon && <secondaryAction.icon className="w-5 h-5 mr-2" />}
                {secondaryAction.label}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}