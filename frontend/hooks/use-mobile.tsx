/**
 * @fileoverview Custom hook for detecting mobile device viewport.
 * This hook provides a responsive way to determine if the current viewport
 * matches mobile device dimensions.
 */

import * as React from "react"

/**
 * Breakpoint width in pixels that defines the mobile viewport threshold.
 * @constant
 * @type {number}
 */
const MOBILE_BREAKPOINT = 768

/**
 * Custom hook that detects if the current viewport is mobile-sized.
 * 
 * @function
 * @returns {boolean} True if the viewport width is less than MOBILE_BREAKPOINT
 * 
 * @example
 * ```tsx
 * const isMobile = useIsMobile();
 * if (isMobile) {
 *   // Render mobile-specific UI
 * }
 * ```
 * 
 * @note
 * - Uses window.matchMedia for responsive detection
 * - Updates on window resize
 * - Initializes with undefined to prevent hydration mismatch
 * - Uses a breakpoint of 768px (standard tablet/mobile breakpoint)
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
