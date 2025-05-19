"use client"

import type React from "react"
import { AdminTopNav } from "@/components/admin-top-nav"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <AdminTopNav />
      <main className="flex-1 container mx-auto px-4 md:px-6">{children}</main>
    </div>
  )
}
