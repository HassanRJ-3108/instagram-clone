"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface StoryRingProps {
  user: {
    username: string
    avatar_url?: string
  }
  hasStory?: boolean
  isViewed?: boolean
  onClick?: () => void
  className?: string
}

export function StoryRing({ user, hasStory = false, isViewed = false, onClick, className }: StoryRingProps) {
  return (
    <div className={cn("flex flex-col items-center space-y-1 cursor-pointer", className)} onClick={onClick}>
      <div
        className={cn(
          "p-0.5 rounded-full",
          hasStory && !isViewed && "story-ring",
          hasStory && isViewed && "story-ring-viewed",
        )}
      >
        <Avatar className="h-14 w-14 border-2 border-white">
          <AvatarImage
            src={user.avatar_url || `/placeholder.svg?height=56&width=56&text=${user.username[0].toUpperCase()}`}
          />
          <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
      <span className="text-xs text-gray-900 truncate w-16 text-center">{user.username}</span>
    </div>
  )
}
