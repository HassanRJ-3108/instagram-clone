"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Post } from "@/lib/types"

interface PostCardProps {
  post: Post
  onLike?: (postId: string) => void
  onComment?: (postId: string) => void
}

export function PostCard({ post, onLike, onComment }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.is_liked || false)
  const [likesCount, setLikesCount] = useState(post.likes_count)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1))
    onLike?.(post.id)
  }

  return (
    <article className="bg-white border-b border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-3">
          <Link href={`/profile/${post.user?.username}`}>
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={
                  post.user?.avatar_url ||
                  `/placeholder.svg?height=32&width=32&text=${post.user?.username?.[0].toUpperCase()}`
                }
              />
              <AvatarFallback>{post.user?.username?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex items-center space-x-1">
            <Link href={`/profile/${post.user?.username}`} className="font-semibold text-sm">
              {post.user?.username}
            </Link>
            {post.user?.is_verified && (
              <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Image */}
      <div className="relative aspect-square">
        <Image
          src={post.image_url || "/placeholder.svg"}
          alt={post.caption || "Post image"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="h-8 w-8 p-0" onClick={handleLike}>
              <Heart className={cn("h-6 w-6", isLiked && "fill-red-500 text-red-500")} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 p-0" onClick={() => onComment?.(post.id)}>
              <MessageCircle className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
              <Send className="h-6 w-6" />
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
            <Bookmark className="h-6 w-6" />
          </Button>
        </div>

        {/* Likes */}
        {likesCount > 0 && (
          <div className="font-semibold text-sm mb-2">
            {likesCount.toLocaleString()} {likesCount === 1 ? "like" : "likes"}
          </div>
        )}

        {/* Caption */}
        {post.caption && (
          <div className="text-sm mb-2">
            <Link href={`/profile/${post.user?.username}`} className="font-semibold mr-2">
              {post.user?.username}
            </Link>
            <span>{post.caption}</span>
          </div>
        )}

        {/* Comments */}
        {post.comments_count > 0 && (
          <button className="text-gray-500 text-sm mb-2" onClick={() => onComment?.(post.id)}>
            View all {post.comments_count} comments
          </button>
        )}

        {/* Time */}
        <div className="text-gray-500 text-xs uppercase">{new Date(post.created_at).toLocaleDateString()}</div>
      </div>
    </article>
  )
}
