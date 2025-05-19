"use client"

import type React from "react"


/**
 * AdminLayout component that provides a consistent layout structure for admin pages.
 * 
 * This layout includes:
 * - A header component at the top
 * - A main content area that flexibly grows to fill available space
 * - Responsive padding that adjusts based on screen size
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be rendered in the main content area
 * @returns {JSX.Element} A layout wrapper with header and main content area
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">

      <main className="flex-1 container mx-auto px-4 md:px-6">{children}</main>
      
    </div>
  )
}
