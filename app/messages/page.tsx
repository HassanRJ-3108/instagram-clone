"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Edit, Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MobileNav } from "@/components/mobile-nav"
import type { Conversation } from "@/lib/types"
import Link from "next/link"

export default function MessagesPage() {
  const { user: clerkUser } = useUser()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (clerkUser) {
      fetchConversations()
    }
  }, [clerkUser])

  const fetchConversations = async () => {
    try {
      // This would fetch conversations for the current user
      // For now, we'll use mock data
      const mockConversations: Conversation[] = [
        {
          id: "1",
          user1_id: "current-user",
          user2_id: "other-user-1",
          updated_at: new Date().toISOString(),
          other_user: {
            id: "other-user-1",
            clerk_id: "clerk-1",
            username: "john_doe",
            email: "john@example.com",
            full_name: "John Doe",
            avatar_url: "/placeholder.svg?height=40&width=40&text=JD",
            is_verified: false,
            is_private: false,
            followers_count: 150,
            following_count: 200,
            posts_count: 25,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          last_message: {
            id: "msg-1",
            sender_id: "other-user-1",
            receiver_id: "current-user",
            content: "Hey! How are you doing?",
            is_read: false,
            created_at: new Date().toISOString(),
          },
        },
        {
          id: "2",
          user1_id: "current-user",
          user2_id: "other-user-2",
          updated_at: new Date(Date.now() - 3600000).toISOString(),
          other_user: {
            id: "other-user-2",
            clerk_id: "clerk-2",
            username: "jane_smith",
            email: "jane@example.com",
            full_name: "Jane Smith",
            avatar_url: "/placeholder.svg?height=40&width=40&text=JS",
            is_verified: true,
            is_private: false,
            followers_count: 500,
            following_count: 300,
            posts_count: 45,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          last_message: {
            id: "msg-2",
            sender_id: "current-user",
            receiver_id: "other-user-2",
            content: "Thanks for sharing that post!",
            is_read: true,
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
        },
      ]

      setConversations(mockConversations)
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "now"
    if (diffInHours < 24) return `${diffInHours}h`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`
    return `${Math.floor(diffInHours / 168)}w`
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
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-semibold">{clerkUser?.username || "User"}</h1>
          </div>
          <Button variant="ghost" size="icon">
            <Edit className="h-6 w-6" />
          </Button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-100 border-none rounded-lg"
            />
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        {conversations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No messages yet</div>
            <Link href="/search" className="text-blue-500 font-semibold">
              Send your first message
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/messages/${conversation.other_user?.username}`}
                className="flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors"
              >
                <Avatar className="h-14 w-14">
                  <AvatarImage src={conversation.other_user?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>{conversation.other_user?.username?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1">
                      <p className="font-semibold text-sm truncate">{conversation.other_user?.username}</p>
                      {conversation.other_user?.is_verified && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <span className="text-gray-400 text-xs">{formatTime(conversation.updated_at)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p
                      className={`text-sm truncate ${
                        conversation.last_message?.is_read ? "text-gray-500" : "text-gray-900 font-medium"
                      }`}
                    >
                      {conversation.last_message?.content || "No messages yet"}
                    </p>
                    {!conversation.last_message?.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  )
}
