"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/mobile-nav"
import { Heart, MessageCircle, UserPlus } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { userApi } from "@/lib/api/user-api"
import { useUser } from "@clerk/nextjs"

interface Notification {
  id: string
  type: "like" | "comment" | "follow" | "mention"
  from_user: {
    username: string
    avatar_url?: string
    is_verified: boolean
  }
  post?: {
    id: string
    image_url: string
  }
  message: string
  created_at: string
  is_read: boolean
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useUser()

  useEffect(() => {
    fetchNotifications()
  }, [user])

  const fetchNotifications = async () => {
    if (!user) return

    try {
      // Get current user from database
      const currentUser = await userApi.getCurrentUser(user.id)
      if (!currentUser) return

      // Fetch real notifications
      const { data, error } = await supabase
        .from("notifications")
        .select(`
          *,
          from_user:users!notifications_from_user_id_fkey(*),
          post:posts(*)
        `)
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setNotifications(data || [])
    } catch (error) {
      console.error("Error fetching notifications:", error)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "now"
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
    return `${Math.floor(diffInMinutes / 1440)}d`
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500 fill-current" />
      case "comment":
        return <MessageCircle className="h-4 w-4 text-gray-600" />
      case "follow":
        return <UserPlus className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="animate-pulse p-4">
          <div className="h-12 bg-gray-200 mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 mb-4">
              <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
        <MobileNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-12 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-semibold">Notifications</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No notifications yet</div>
            <p className="text-sm text-gray-400">When someone likes or comments on your posts, you'll see it here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-center space-x-3 p-4 ${!notification.is_read ? "bg-blue-50" : ""}`}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={notification.from_user.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{notification.from_user.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1 mb-1">
                    <Link
                      href={`/profile/${notification.from_user.username}`}
                      className="font-semibold text-sm hover:underline"
                    >
                      {notification.from_user.username}
                    </Link>
                    {notification.from_user.is_verified && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                    <span className="text-sm text-gray-600">{notification.message}</span>
                    <span className="text-gray-400 text-xs ml-auto">{formatTime(notification.created_at)}</span>
                  </div>
                </div>

                {notification.post && (
                  <Link href={`/post/${notification.post.id}`}>
                    <div className="w-12 h-12 relative">
                      <img
                        src={notification.post.image_url || "/placeholder.svg"}
                        alt="Post"
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  </Link>
                )}

                {notification.type === "follow" && (
                  <Button size="sm" variant="outline">
                    Follow
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  )
}
