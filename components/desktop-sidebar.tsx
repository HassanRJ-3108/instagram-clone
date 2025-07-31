"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Home, Search, Compass, Heart, PlusSquare, MessageCircle, User, Menu, Settings } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const sidebarItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/explore", icon: Compass, label: "Explore" },
  { href: "/reels", icon: PlusSquare, label: "Reels" },
  { href: "/messages", icon: MessageCircle, label: "Messages" },
  { href: "/notifications", icon: Heart, label: "Notifications" },
  { href: "/create", icon: PlusSquare, label: "Create" },
  { href: "/profile", icon: User, label: "Profile" },
]

export function DesktopSidebar() {
  const pathname = usePathname()
  const { user } = useUser()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <Link href="/" className="text-2xl font-bold instagram-gradient bg-clip-text text-transparent">
              Instagram
            </Link>
          )}
          <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="ml-auto">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors hover:bg-gray-100",
                    isActive && "bg-gray-100 font-semibold",
                    isCollapsed && "justify-center",
                  )}
                >
                  <Icon className={cn("h-6 w-6", isActive && "fill-current")} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <Link
          href="/profile"
          className={cn(
            "flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-gray-100 transition-colors",
            isCollapsed && "justify-center",
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.imageUrl || "/placeholder.svg"} />
            <AvatarFallback>{user?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{user?.username}</p>
              <p className="text-gray-500 text-xs truncate">{user?.fullName}</p>
            </div>
          )}
        </Link>

        {!isCollapsed && (
          <Link
            href="/settings"
            className="flex items-center space-x-3 px-3 py-2 mt-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span className="text-sm">Settings</span>
          </Link>
        )}
      </div>
    </aside>
  )
}
