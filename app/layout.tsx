/**
 * @fileoverview Root layout component that provides the base structure for the entire application.
 * This layout includes global providers, header, footer, and main content area.
 */

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/auth-context"

const inter = Inter({ subsets: ["latin"] })

/**
 * Application metadata configuration
 * @type {Metadata}
 */
export const metadata: Metadata = {
  title: "Citizen Engagement System",
  description: "A platform for citizens to submit feedback and track issues",
  generator: 'v0.dev'
}

/**
 * Root layout component that wraps the entire application.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be rendered in the main content area
 * @returns {JSX.Element} The root layout structure including:
 * - HTML document with language and hydration settings
 * - Theme provider for dark/light mode support
 * - Authentication provider for user management
 * - Header component for navigation
 * - Main content area with responsive container
 * - Footer with copyright information
 * - Toast notifications system
 * 
 * @example
 * ```tsx
 * <RootLayout>
 *   <YourPageComponent />
 * </RootLayout>
 * ```
 * 
 * @note
 * - Uses Inter font from Google Fonts
 * - Implements responsive design with container classes
 * - Includes system theme detection and manual theme switching
 * - Provides global toast notifications
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1 container mx-auto px-4 md:px-6">{children}</main>
              <footer className="border-t py-4">
                <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
                  <p className="text-center text-sm text-muted-foreground md:text-left">
                    &copy; {new Date().getFullYear()} Citizen Engagement System. All rights reserved.
                  </p>
                </div>
              </footer>
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
