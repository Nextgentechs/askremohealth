'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@web/components/ui/dialog'
import { Button } from '@web/components/ui/button'
import Link from 'next/link'

export default function AppointmentConfirmation({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogTitle hidden>Appointment Confirmation</DialogTitle>
        <div className="text-center">
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                }}
                className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{
                    delay: 0.2,
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                  }}
                >
                  <Check className="h-12 w-12 text-green-600" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-4 text-2xl font-bold"
          >
            Appointment successfully booked
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8 text-muted-foreground"
          >
            Log in or complete registration to track and manage your
            appointments
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-x-4"
          >
            <Link href="/auth/login">
              <Button variant="default">Log In</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button variant="outline">Complete Registration</Button>
            </Link>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
