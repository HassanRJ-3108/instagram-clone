"use client"

import { useState, useEffect, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Play, VolumeX, Volume2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { User } from "@/lib/types"

interface Reel {
  id: string
  user_id: string
  video_url: string
  thumbnail_url?: string
  caption?: string
  likes_count: number
  comments_count: number
  views_count: number
  created_at: string
  user?: User
  is_liked?: boolean
}

export default function ReelsPage() {
  const { user } = useUser()
  const [reels, setReels] = useState<Reel[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchReels()
  }, [])

  useEffect(() => {
    // Play current video and pause others
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentIndex && isPlaying) {
          video.play()
        } else {
          video.pause()
        }
        video.muted = isMuted
      }
    })
  }, [currentIndex, isPlaying, isMuted])

  const fetchReels = async () => {
    try {
      // Mock reels data - replace with actual API call
      const mockReels: Reel[] = Array.from({ length: 10 }, (_, i) => ({
        id: `reel-${i + 1}`,
        user_id: `user-${i + 1}`,
        video_url: `/placeholder-video.mp4`,
        caption: `Amazing reel #${i + 1} 🔥`,
        likes_count: Math.floor(Math.random() * 10000),
        comments_count: Math.floor(Math.random() * 1000),
        views_count: Math.floor(Math.random() * 100000),
        created_at: new Date(Date.now() - i * 86400000).toISOString(),
        user: {
          id: `user-${i + 1}`,
          clerk_id: `clerk-${i + 1}`,
          username: `user${i + 1}`,
          email: `user${i + 1}@example.com`,
          full_name: `User ${i + 1}`,
          avatar_url: `/placeholder.svg?height=40&width=40&text=U${i + 1}`,
          is_verified: Math.random() > 0.7,
          is_private: false,
          followers_count: Math.floor(Math.random() * 10000),
          following_count: Math.floor(Math.random() * 1000),
          posts_count: Math.floor(Math.random() * 100),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        is_liked: Math.random() > 0.5,
      }))

      setReels(mockReels)
    } catch (error) {
      console.error("Error fetching reels:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleScroll = () => {
    if (!containerRef.current) return

    const container = containerRef.current
    const scrollTop = container.scrollTop
    const itemHeight = container.clientHeight
    const newIndex = Math.round(scrollTop / itemHeight)

    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < reels.length) {
      setCurrentIndex(newIndex)
    }
  }

  const handleLike = async (reelId: string) => {
    setReels((prev) =>
      prev.map((reel) =>
        reel.id === reelId
          ? {
              ...reel,
              is_liked: !reel.is_liked,
              likes_count: reel.is_liked ? reel.likes_count - 1 : reel.likes_count + 1,
            }
          : reel,
      ),
    )
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading reels...</div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-black overflow-hidden">
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
        onScroll={handleScroll}
      >
        {reels.map((reel, index) => (
          <div key={reel.id} className="h-screen w-full relative snap-start flex items-center justify-center">
            {/* Video */}
            <video
              ref={(el) => { videoRefs.current[index] = el; }}
              src={reel.video_url}
              className="h-full w-full object-cover"
              loop
              playsInline
              muted={isMuted}
              onClick={togglePlayPause}
            />

            {/* Overlay Controls */}
            <div className="absolute inset-0 flex">
              {/* Left side - tap to play/pause */}
              <div className="flex-1" onClick={togglePlayPause} />

              {/* Right side - actions */}
              <div className="w-16 flex flex-col justify-end items-center pb-20 space-y-6">
                {/* User Avatar */}
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-white">
                    <AvatarImage src={reel.user?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{reel.user?.username?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 text-white"
                  >
                    +
                  </Button>
                </div>

                {/* Like */}
                <div className="flex flex-col items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 h-12 w-12"
                    onClick={() => handleLike(reel.id)}
                  >
                    <Heart className={cn("h-7 w-7", reel.is_liked && "fill-red-500 text-red-500")} />
                  </Button>
                  <span className="text-white text-xs font-semibold">
                    {reel.likes_count > 999 ? `${(reel.likes_count / 1000).toFixed(1)}K` : reel.likes_count}
                  </span>
                </div>

                {/* Comment */}
                <div className="flex flex-col items-center">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-12 w-12">
                    <MessageCircle className="h-7 w-7" />
                  </Button>
                  <span className="text-white text-xs font-semibold">
                    {reel.comments_count > 999 ? `${(reel.comments_count / 1000).toFixed(1)}K` : reel.comments_count}
                  </span>
                </div>

                {/* Share */}
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-12 w-12">
                  <Send className="h-7 w-7" />
                </Button>

                {/* Save */}
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-12 w-12">
                  <Bookmark className="h-7 w-7" />
                </Button>

                {/* More */}
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-12 w-12">
                  <MoreHorizontal className="h-7 w-7" />
                </Button>
              </div>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-0 left-0 right-16 p-4 text-white">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-semibold">@{reel.user?.username}</span>
                {reel.user?.is_verified && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
              {reel.caption && <p className="text-sm mb-2">{reel.caption}</p>}
              <div className="text-xs text-gray-300">
                {reel.views_count > 999 ? `${(reel.views_count / 1000).toFixed(1)}K` : reel.views_count} views
              </div>
            </div>

            {/* Play/Pause indicator */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/50 rounded-full p-4">
                  <Play className="h-12 w-12 text-white fill-current" />
                </div>
              </div>
            )}

            {/* Mute/Unmute button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
