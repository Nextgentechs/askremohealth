"use client"

import type { ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@web/lib/utils"

interface CustomAccordionProps {
  children: ReactNode
  className?: string
}

export function CustomAccordion({ children, className }: CustomAccordionProps) {
  return <div className={cn("border rounded-xl overflow-hidden", className)}>{children}</div>
}

interface CustomAccordionItemProps {
  children: ReactNode
  className?: string
}

export function CustomAccordionItem({ children, className }: CustomAccordionItemProps) {
  return <div className={cn("border-0", className)}>{children}</div>
}

interface CustomAccordionTriggerProps {
  children: ReactNode
  className?: string
  isOpen: boolean
  onClick: () => void
}

export function CustomAccordionTrigger({ children, className, isOpen, onClick }: CustomAccordionTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("flex items-center justify-between w-full px-6 py-4 text-left", className)}
    >
      <div>{children}</div>
      <ChevronDown className={cn("h-5 w-5 transition-transform duration-200", isOpen ? "transform rotate-180" : "")} />
    </button>
  )
}

interface CustomAccordionContentProps {
  children: ReactNode
  className?: string
  isOpen: boolean
}

export function CustomAccordionContent({ children, className, isOpen }: CustomAccordionContentProps) {
  if (!isOpen) return null

  return <div className={cn("pt-4 pb-0 px-0", className)}>{children}</div>
}

