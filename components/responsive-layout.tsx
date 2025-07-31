"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { DesktopSidebar } from "./desktop-sidebar"
import { MobileNav } from "./mobile-nav"
import { socketService } from "@/lib/socket"

interface ResponsiveLayoutProps {
  children: React.ReactNode
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const { user } = useUser()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (user?.id) {
      socketService.connect(user.id)
    }

    return () => {
      socketService.disconnect()
    }
  }, [user?.id])

  return (
    <div className="flex min-h-screen bg-white">
      {/* Desktop Sidebar - Fixed position */}
      {!isMobile && <DesktopSidebar />}

      {/* Main Content - Proper margin for desktop */}
      <main className={`flex-1 min-h-screen ${!isMobile ? "" : "pb-12"}`}>{children}</main>

      {/* Mobile Navigation */}
      {isMobile && <MobileNav />}
    </div>
  )
}
