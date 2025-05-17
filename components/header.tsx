/**
 * @fileoverview Header component that provides the main navigation and user authentication
 * interface for the application. Includes responsive design with mobile menu and
 * user profile dropdown.
 */

"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/**
 * Header component that provides the main navigation bar for the application.
 * 
 * @component
 * @returns {JSX.Element} A responsive header with the following features:
 * - Application logo/brand
 * - Main navigation links (Home, Submit Feedback, Public Issues, Dashboard)
 * - Mobile-responsive menu (hamburger menu on small screens)
 * - Theme toggle (light/dark mode)
 * - User authentication interface:
 *   - Sign in button for unauthenticated users
 *   - User avatar with dropdown menu for authenticated users
 * 
 * @example
 * ```tsx
 * <Header />
 * ```
 * 
 * @note
 * - Uses the auth context for user authentication state
 * - Implements responsive design with mobile-first approach
 * - Includes backdrop blur effect for better visibility
 * - Provides user profile dropdown with navigation options
 */
export default function Header() {
  const { user, signIn, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-4 md:gap-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="grid gap-6 text-lg font-medium">
                <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                  Citizen Engagement
                </Link>
                <Link href="/" className="hover:text-foreground/80">
                  Home
                </Link>
                <Link href="/submit" className="hover:text-foreground/80">
                  Submit Feedback
                </Link>
                <Link href="/issues" className="hover:text-foreground/80">
                  Public Issues
                </Link>
                <Link href="/dashboard" className="hover:text-foreground/80">
                  My Dashboard
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            Citizen Engagement
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="hover:text-foreground/80">
              Home
            </Link>
            <Link href="/submit" className="hover:text-foreground/80">
              Submit Feedback
            </Link>
            <Link href="/issues" className="hover:text-foreground/80">
              Public Issues
            </Link>
            <Link href="/dashboard" className="hover:text-foreground/80">
              My Dashboard
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={signIn}>Sign In</Button>
          )}
        </div>
      </div>
    </header>
  )
}
