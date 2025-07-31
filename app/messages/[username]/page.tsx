"use client"

import { useState, useEffect, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Phone, Video, Info, Send, ImageIcon, Heart } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { messagesApi, userApi } from "@/lib/api"
import { socketService } from "@/lib/socket"
import type { Message, User } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function ChatPage() {
  const { user } = useUser()
  const params = useParams()
  const router = useRouter()
  const username = params.username as string

  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [otherUser, setOtherUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [conversationId, setConversationId] = useState<string>("")

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      initializeChat()
    }
  }, [user, username])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Socket event listeners
    socketService.onNewMessage((message: Message) => {
      if (message.sender_id === otherUser?.id || message.receiver_id === otherUser?.id) {
        setMessages((prev) => [message, ...prev])
      }
    })

    socketService.onTyping(({ conversationId: convId, userId }) => {
      if (convId === conversationId && userId === otherUser?.id) {
        setIsTyping(true)
      }
    })

    socketService.onStopTyping(({ conversationId: convId, userId }) => {
      if (convId === conversationId && userId === otherUser?.id) {
        setIsTyping(false)
      }
    })

    return () => {
      socketService.stopTyping(conversationId)
    }
  }, [conversationId, otherUser?.id])

  const initializeChat = async () => {
    if (!user) return

    try {
      const [currentUserData, otherUserData] = await Promise.all([
        userApi.getCurrentUser(user.id),
        userApi.searchUsers(username).then((users) => users.find((u) => u.username === username)),
      ])

      if (!currentUserData || !otherUserData) {
        router.push("/messages")
        return
      }

      setCurrentUser(currentUserData)
      setOtherUser(otherUserData)

      // Get conversation and messages
      const conversations = await messagesApi.getConversations(currentUserData.id)
      const conversation = conversations.find((c) => c.other_user?.id === otherUserData.id)

      if (conversation) {
        setConversationId(conversation.id)
        const messagesData = await messagesApi.getMessages(conversation.id)
        setMessages(messagesData.reverse())
      }
    } catch (error) {
      console.error("Error initializing chat:", error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !otherUser || sending) return

    setSending(true)
    const messageContent = newMessage
    setNewMessage("")

    try {
      const message = await messagesApi.sendMessage(currentUser.id, otherUser.id, messageContent, conversationId)

      if (message) {
        setMessages((prev) => [...prev, message])

        // Send via socket
        socketService.sendMessage({
          receiverId: otherUser.id,
          content: messageContent,
          conversationId: conversationId || message.id,
        })

        if (!conversationId) {
          setConversationId(message.id)
        }
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setNewMessage(messageContent) // Restore message on error
    } finally {
      setSending(false)
    }
  }

  const handleTyping = () => {
    if (conversationId) {
      socketService.startTyping(conversationId)

      // Stop typing after 3 seconds of inactivity
      setTimeout(() => {
        socketService.stopTyping(conversationId)
      }, 3000)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading chat...</div>
      </div>
    )
  }

  if (!otherUser) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">User not found</div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-white flex flex-col max-w-2xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-6 w-6" />
          </Button>

          <Avatar className="h-10 w-10">
            <AvatarImage src={otherUser.avatar_url || "/placeholder.svg"} />
            <AvatarFallback>{otherUser.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1">
              <h1 className="font-semibold text-lg truncate">{otherUser.username}</h1>
              {otherUser.is_verified && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            {isTyping && <p className="text-sm text-gray-500">typing...</p>}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Avatar className="h-20 w-20 mx-auto mb-4">
              <AvatarImage src={otherUser.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="text-2xl">{otherUser.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-lg mb-2">{otherUser.full_name || otherUser.username}</h3>
            <p className="text-gray-500 mb-4">@{otherUser.username}</p>
            <p className="text-gray-500 text-sm">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === currentUser?.id

            return (
              <div key={message.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-xs lg:max-w-md px-4 py-2 rounded-2xl",
                    isOwn ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900",
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={cn("text-xs mt-1", isOwn ? "text-blue-100" : "text-gray-500")}>
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon">
            <ImageIcon className="h-5 w-5" />
          </Button>

          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value)
                handleTyping()
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="Message..."
              className="rounded-full border-gray-300 pr-12"
            />

            {newMessage.trim() ? (
              <Button
                onClick={handleSendMessage}
                disabled={sending}
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full h-8 w-8 p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
              >
                <Heart className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
