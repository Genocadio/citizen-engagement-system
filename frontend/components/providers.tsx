"use client"

import * as React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { ApolloProvider } from "@apollo/client"
import { client } from "@/lib/apollo-client"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/toaster"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ApolloProvider client={client}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </ApolloProvider>
    </ThemeProvider>
  )
} 