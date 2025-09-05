'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/src/components/ui/card'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: string
    type: 'increase' | 'decrease' | 'neutral'
  }
  icon: LucideIcon
  color?: 'teal' | 'emerald' | 'blue' | 'purple' | 'orange' | 'red'
  className?: string
}

export function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  color = 'teal',
  className
}: StatsCardProps) {
  const colorSchemes: Record<string, { bg: string; icon: string; accent: string }> = {
    teal: {
      bg: 'from-teal-500 to-teal-600',
      icon: 'text-teal-600',
      accent: 'bg-teal-50'
    },
    emerald: {
      bg: 'from-emerald-500 to-emerald-600',
      icon: 'text-emerald-600',
      accent: 'bg-emerald-50'
    },
    blue: {
      bg: 'from-blue-500 to-blue-600',
      icon: 'text-blue-600',
      accent: 'bg-blue-50'
    },
    purple: {
      bg: 'from-purple-500 to-purple-600',
      icon: 'text-purple-600',
      accent: 'bg-purple-50'
    },
    orange: {
      bg: 'from-orange-500 to-orange-600',
      icon: 'text-orange-600',
      accent: 'bg-orange-50'
    },
    red: {
      bg: 'from-red-500 to-red-600',
      icon: 'text-red-600',
      accent: 'bg-red-50'
    },
    green: {
      bg: 'from-green-500 to-green-600',
      icon: 'text-green-600',
      accent: 'bg-green-50'
    }
  }

  const scheme = colorSchemes[color] || colorSchemes.teal

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className={className}
    >
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
        <div className={`bg-gradient-to-r ${scheme.bg} p-0.5`}>
          <div className="bg-white rounded-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {title}
                  </p>
                  <motion.p
                    className="text-3xl font-bold text-gray-900"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {value}
                  </motion.p>
                  
                  {change && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center gap-1 mt-2"
                    >
                      <span
                        className={cn(
                          'text-xs font-medium px-2 py-1 rounded-full',
                          change.type === 'increase' && 'text-green-700 bg-green-100',
                          change.type === 'decrease' && 'text-red-700 bg-red-100',
                          change.type === 'neutral' && 'text-gray-700 bg-gray-100'
                        )}
                      >
                        {change.type === 'increase' && '↗'}
                        {change.type === 'decrease' && '↘'}
                        {change.type === 'neutral' && '→'}
                        {change.value}
                      </span>
                    </motion.div>
                  )}
                </div>

                <motion.div
                  className={cn('p-3 rounded-full', scheme.accent)}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 400, damping: 10 }}
                  whileHover={{ scale: 1.1, rotate: 10 }}
                >
                  <Icon className={cn('h-6 w-6', scheme.icon)} />
                </motion.div>
              </div>
            </CardContent>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// Grid container for stats cards
export function StatsGrid({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={cn(
      'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
      className
    )}>
      {children}
    </div>
  )
}