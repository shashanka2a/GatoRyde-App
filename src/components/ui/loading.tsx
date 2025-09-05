'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Car, Loader2 } from 'lucide-react'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  variant?: 'default' | 'car' | 'minimal'
}

export function Loading({ 
  size = 'md', 
  text = 'Loading...', 
  variant = 'default' 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center gap-2">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-teal-600`} />
        {text && <span className={`${textSizeClasses[size]} text-gray-600`}>{text}</span>}
      </div>
    )
  }

  if (variant === 'car') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <motion.div
          animate={{ 
            x: [0, 20, 0],
            rotate: [0, 5, 0, -5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Car className={`${sizeClasses[size]} text-teal-600`} />
        </motion.div>
        {text && (
          <motion.p 
            className={`${textSizeClasses[size]} text-gray-600 font-medium`}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {text}
          </motion.p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12">
      {/* Animated Logo */}
      <motion.div
        className="relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white p-4 rounded-full">
          <Car className={sizeClasses[size]} />
        </div>
        
        {/* Pulse Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-teal-400"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Loading Text */}
      {text && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className={`${textSizeClasses[size]} font-medium text-gray-700 mb-2`}>
            {text}
          </p>
          <motion.div
            className="flex justify-center gap-1"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-teal-600 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

// Full page loading component
export function PageLoading({ text = 'Loading your ride...' }: { text?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-0">
        <Loading size="lg" text={text} />
      </div>
    </div>
  )
}