"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, PlusSquare, Heart, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/create", icon: PlusSquare, label: "Create" },
  { href: "/notifications", icon: Heart, label: "Notifications" },
  { href: "/profile", icon: User, label: "Profile" },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex justify-around items-center h-12">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 transition-colors",
                isActive ? "text-black" : "text-gray-400",
              )}
            >
              <Icon className={cn("h-6 w-6", isActive && "fill-current")} />
              <span className="sr-only">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
