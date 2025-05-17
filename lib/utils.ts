/**
 * @fileoverview Utility functions for the application.
 * This module provides helper functions for class name merging, date formatting,
 * and ticket number generation.
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names and merges Tailwind CSS classes.
 * 
 * @function
 * @param {...ClassValue[]} inputs - Class names to be combined
 * @returns {string} Merged class names string
 * 
 * @example
 * ```tsx
 * cn("base-class", "conditional-class", { "dynamic-class": isActive })
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date into a human-readable relative time string.
 * 
 * @function
 * @param {Date} date - The date to format
 * @returns {string} Relative time string (e.g., "2 hours ago", "3 days ago")
 * 
 * @example
 * ```tsx
 * formatDistanceToNow(new Date("2024-01-01"))
 * // Returns: "3 months ago"
 * ```
 * 
 * @note
 * - Handles time units from seconds to years
 * - Uses proper pluralization
 * - Returns the most appropriate time unit
 */
export function formatDistanceToNow(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths !== 1 ? "s" : ""} ago`
  }

  const diffInYears = Math.floor(diffInMonths / 12)
  return `${diffInYears} year${diffInYears !== 1 ? "s" : ""} ago`
}

/**
 * Generates a unique ticket number for feedback submissions.
 * 
 * @function
 * @returns {string} A ticket number in the format "CT-XXXXXX"
 * 
 * @example
 * ```tsx
 * generateTicketNumber()
 * // Returns: "CT-123456"
 * ```
 * 
 * @note
 * - Uses a "CT-" prefix
 * - Generates a random 6-digit number
 * - Format: CT-XXXXXX where X is a digit
 */
export function generateTicketNumber(): string {
  const prefix = "CT-"
  const randomNum = Math.floor(100000 + Math.random() * 900000)
  return `${prefix}${randomNum}`
}
