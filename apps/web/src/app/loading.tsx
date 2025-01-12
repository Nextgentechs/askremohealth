'use client'

import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center pb-20">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              color: [
                'hsl(254, 46.2%, 33.5%)',
                'hsl(254, 46.2%, 43.5%)',
                'hsl(254, 46.2%, 33.5%)',
              ],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          >
            <Activity className="h-24 w-24" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
