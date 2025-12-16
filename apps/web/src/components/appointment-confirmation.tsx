'use client'

/**
 * Appointment Confirmation Dialog
 *
 * Displayed after successfully booking an appointment.
 * Provides clear next steps for the user - either login or register.
 *
 * @module components/appointment-confirmation
 */

import { Button } from '@web/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@web/components/ui/dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'

interface AppointmentConfirmationProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  /** If user is already logged in, hide auth options */
  isLoggedIn?: boolean
}

export default function AppointmentConfirmation({
  isOpen,
  setIsOpen,
  isLoggedIn = false,
}: AppointmentConfirmationProps) {
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
            {isLoggedIn
              ? 'Your appointment has been confirmed. You can view and manage it in your dashboard.'
              : 'Log in or complete registration to track and manage your appointments'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-3 sm:justify-center sm:gap-8"
          >
            {!isLoggedIn && (
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-8">
                {/* Fixed: Changed /login to /auth */}
                <Link href="/auth" className="w-full sm:w-auto">
                  <Button variant="default" className="w-full sm:w-auto">
                    Log In
                  </Button>
                </Link>
                {/* Fixed: Changed /sign-up to /auth with signup query param */}
                <Link href="/auth?mode=signup" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Register
                  </Button>
                </Link>
              </div>
            )}
            {isLoggedIn && (
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-8">
                <Link
                  href="/patient/online-appointments"
                  className="w-full sm:w-auto"
                >
                  <Button variant="default" className="w-full sm:w-auto">
                    View My Appointments
                  </Button>
                </Link>
              </div>
            )}
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="link" className="my-0 w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4" />
                Back to homepage
              </Button>
            </Link>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
