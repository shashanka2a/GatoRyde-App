'use client'


import { Button } from '@/src/components/ui/button'

import { 
  Car, 
  ArrowRight
} from 'lucide-react'
import { motion } from 'framer-motion'


interface DriverSetupPromptProps {
  onStartSetup: () => void
  userEduVerified: boolean
}

export function DriverSetupPrompt({ onStartSetup }: DriverSetupPromptProps) {
  const benefits = [
    {
      icon: "💵",
      title: "Earn $15–50+",
      description: "Make money while helping fellow students get around campus"
    },
    {
      icon: "🤝",
      title: "Help Community",
      description: "Connect with fellow students and build campus relationships"
    },
    {
      icon: "✅",
      title: "Verified Students",
      description: "All riders are verified UF students for your safety"
    },
    {
      icon: "⏱",
      title: "5-Minute Setup",
      description: "Quick verification process to get you started immediately"
    },
    {
      icon: "🛡",
      title: "100% Safe Rides",
      description: "Student-only platform with verified users and secure payments"
    }
  ]



  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Mobile-optimized header - minimal */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto py-4 px-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <a href="/" className="hover:text-gray-700 transition-colors">
              Home
            </a>
            <ArrowRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Driver</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto py-6 px-4">
        <div className="max-w-lg mx-auto space-y-6">
          
          {/* Start Earning Today - Merged Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Start Earning Today
              </h1>
              <p className="text-gray-600">
                Join verified UF students making money while helping their community
              </p>
            </div>

            {/* Stacked benefit list */}
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0 mt-0.5">
                      {benefit.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>

      {/* Sticky CTA at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
        <div className="container mx-auto max-w-lg">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={onStartSetup}
              size="lg"
              className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-4 text-lg font-bold rounded-xl"
            >
              <Car className="w-5 h-5 mr-2" />
              Start Earning Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
          <p className="text-center text-sm text-gray-500 mt-2">
            No upfront costs • Flexible schedule
          </p>
        </div>
      </div>
    </div>
  )
}