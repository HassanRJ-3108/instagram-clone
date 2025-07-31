"use client"

import { cn } from "@/lib/utils"

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
    <div className="min-h-screen bg-white">
      {!isMobile && <DesktopSidebar />}

      <main className={cn("min-h-screen", !isMobile ? "lg:ml-64" : "pb-12")}>{children}</main>

      {isMobile && <MobileNav />}
    </div>
  )
}
