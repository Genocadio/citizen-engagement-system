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
 * @property {string} email - User's email address
 * @property {string} firstName - User's first name
 * @property {string} lastName - User's last name (optional)
 * @property {string} username - User's username (optional)
 * @property {string} phoneNumber - User's phone number (optional)
 * @property {string} role - User's role in the system
 * @property {string} avatar - User's avatar URL (optional)
 */
type User = {
  id: string
  email: string
  firstName: string
  lastName?: string
  username?: string
  phoneNumber?: string
  role: string
  avatar?: string
}

/**
 * Authentication context type definition
 * @typedef {Object} AuthContextType
 * @property {User|null} user - Current authenticated user or null if not authenticated
 * @property {boolean} isLoading - Whether the initial auth check is in progress
 * @property {Function} signIn - Function to sign in a user with token and user data
 * @property {Function} signOut - Function to sign out the current user
 */
type AuthContextType = {
  user: User | null
  isLoading: boolean
  signIn: (token: string, userData: User) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Secure storage keys
const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

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
 * - Persists user data and token in localStorage
 * - Handles authentication state management
 * - Includes toast notifications for auth state changes
 * - Manages loading state during initial auth check
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Load user data from localStorage on client side
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem(USER_KEY)
        const storedToken = localStorage.getItem(TOKEN_KEY)
        
        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser)
          setUser(userData)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        // Clear invalid data
        localStorage.removeItem(USER_KEY)
        localStorage.removeItem(TOKEN_KEY)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  /**
   * Signs in a user with token and user data.
   * 
   * @function
   * @param {string} token - Authentication token
   * @param {User} userData - User data from login/registration
   * @returns {void}
   */
  const signIn = (token: string, userData: User) => {
    // Store token and user data
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    
    // Update state
    setUser(userData)

    toast({
      title: "Signed in successfully",
      description: `Welcome back, ${userData.firstName}!`,
    })
  }

  /**
   * Signs out the current user and clears stored data.
   * 
   * @function
   * @returns {void}
   */
  const signOut = () => {
    // Clear stored data
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    
    // Update state
    setUser(null)

    toast({
      title: "Signed out successfully",
      description: "You have been signed out of your account.",
    })
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
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
 * const { user, isLoading, signIn, signOut } = useAuth();
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
