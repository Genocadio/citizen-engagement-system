/**
 * @fileoverview Authentication context provider and hook for managing user authentication state.
 * This module provides a global authentication state and methods for signing in and out.
 */

"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

/**
 * User type definition
 * @typedef {Object} User
 * @property {string} id - Unique identifier for the user
 * @property {string} name - User's full name
 * @property {string} email - User's email address
 * @property {('citizen'|'agency'|'admin')} role - User's role in the system
 */
type User = {
  id: string
  name: string
  email: string
  role: "citizen" | "agency" | "admin"
}

/**
 * Authentication context type definition
 * @typedef {Object} AuthContextType
 * @property {User|null} user - Current authenticated user or null if not authenticated
 * @property {Function} signIn - Function to sign in a user
 * @property {Function} signOut - Function to sign out the current user
 */
type AuthContextType = {
  user: User | null
  signIn: () => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Authentication provider component that manages user authentication state.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be wrapped with auth context
 * @returns {JSX.Element} AuthContext.Provider with authentication state and methods
 * 
 * @example
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 * 
 * @note
 * - Persists user data in localStorage
 * - Provides mock authentication for demo purposes
 * - Includes toast notifications for auth state changes
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const { toast } = useToast()

  // Simulate loading user from localStorage on client side
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  /**
   * Signs in a user with mock data for demo purposes.
   * 
   * @function
   * @returns {void}
   */
  const signIn = () => {
    // Mock user for demo purposes
    const mockUser = {
      id: "user-123",
      name: "Jean Bosco",
      email: "jean@example.com",
      role: "citizen" as const,
    }

    setUser(mockUser)
    localStorage.setItem("user", JSON.stringify(mockUser))

    toast({
      title: "Signed in successfully",
      description: `Welcome back, ${mockUser.name}!`,
    })
  }

  /**
   * Signs out the current user and clears stored data.
   * 
   * @function
   * @returns {void}
   */
  const signOut = () => {
    setUser(null)
    localStorage.removeItem("user")

    toast({
      title: "Signed out successfully",
      description: "You have been signed out of your account.",
    })
  }

  return <AuthContext.Provider value={{ user, signIn, signOut }}>{children}</AuthContext.Provider>
}

/**
 * Custom hook to access the authentication context.
 * 
 * @function
 * @returns {AuthContextType} Authentication context with user state and methods
 * @throws {Error} If used outside of AuthProvider
 * 
 * @example
 * ```tsx
 * const { user, signIn, signOut } = useAuth();
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
