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
      <DialogContent className="w-[95%] max-w-[320px] rounded-xl border bg-background p-6 shadow-lg sm:max-w-lg">
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
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 sm:mb-6 sm:h-24 sm:w-24"
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
                  <Check className="h-8 w-8 text-green-600 sm:h-12 sm:w-12" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-3 text-xl font-bold sm:mb-4 sm:text-2xl"
          >
            Appointment successfully booked
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6 text-sm text-muted-foreground sm:mb-8 sm:text-base"
          >
            Log in or complete registration to track and manage your
            appointments
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-8"
          >
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="default" className="w-full sm:w-auto">
                Log In
              </Button>
            </Link>
            <Link href="/sign-up" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                Register
              </Button>
            </Link>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
