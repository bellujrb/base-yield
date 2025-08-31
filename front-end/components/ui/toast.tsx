"use client"

import * as React from "react"

// Simplified toast types for basic functionality
interface ToastProps {
  variant?: "default" | "destructive"
  className?: string
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

type ToastActionElement = React.ReactElement

// Simple toast components
const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
)

const ToastViewport: React.FC<{ className?: string }> = ({ className }) => (
  <div className={className} />
)

const Toast: React.FC<ToastProps> = ({ children, className }) => (
  <div className={className}>{children}</div>
)

const ToastTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={className}>{children}</div>
)

const ToastDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={className}>{children}</div>
)

const ToastClose: React.FC<{ className?: string }> = ({ className }) => (
  <button className={className}>×</button>
)

const ToastAction: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <button className={className}>{children}</button>
)

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}