"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useUser as useClerkUser } from "@clerk/nextjs"
import { userApi } from "@/lib/api/user-api"
import type { User } from "@/lib/types"

interface UserContextType {
  user: User | null
  loading: boolean
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser } = useClerkUser()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    if (!clerkUser) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const userData = await userApi.getCurrentUser(clerkUser.id)
      setUser(userData)
    } catch (error) {
      console.error("Error fetching user:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    await fetchUser()
  }

  useEffect(() => {
    fetchUser()
  }, [clerkUser])

  return <UserContext.Provider value={{ user, loading, refreshUser }}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
