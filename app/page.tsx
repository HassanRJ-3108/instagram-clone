"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { MobileNav } from "@/components/mobile-nav"
import { StoryRing } from "@/components/story-ring"
import { PostCard } from "@/components/post-card"
import { supabase } from "@/lib/supabase"
import type { Post, Story } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Camera, Heart } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user: clerkUser } = useUser()
  const [posts, setPosts] = useState<Post[]>([])
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (clerkUser) {
      fetchFeedData()
    }
  }, [clerkUser])

  const fetchFeedData = async () => {
    try {
      // Fetch posts with user data
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(`
          *,
          user:users(*)
        `)
        .order("created_at", { ascending: false })
        .limit(20)

      if (postsError) throw postsError

      // Fetch stories that haven't expired
      const { data: storiesData, error: storiesError } = await supabase
        .from("stories")
        .select(`
          *,
          user:users(*)
        `)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })

      if (storiesError) throw storiesError

      setPosts(postsData || [])
      setStories(storiesData || [])
    } catch (error) {
      console.error("Error fetching feed data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId: string) => {
    // Implementation for liking posts
    console.log("Like post:", postId)
  }

  const handleComment = (postId: string) => {
    // Navigate to post detail page
    console.log("Comment on post:", postId)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 mb-4"></div>
          <div className="h-20 bg-gray-200 mb-4"></div>
          <div className="h-96 bg-gray-200 mb-4"></div>
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
          <Link href="/" className="text-2xl font-bold instagram-gradient bg-clip-text text-transparent">
            Instagram
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/messages">
              <Heart className="h-6 w-6" />
            </Link>
            <Link href="/messages">
              <Camera className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </header>

      {/* Stories */}
      <div className="border-b border-gray-200 bg-white">
        <ScrollArea className="w-full">
          <div className="flex space-x-4 p-4 pb-3">
            {/* Your story */}
            <StoryRing
              user={{ username: "Your Story", avatar_url: clerkUser?.imageUrl }}
              hasStory={false}
              className="flex-shrink-0"
            />

            {/* Other stories */}
            {stories.map((story) => (
              <StoryRing
                key={story.id}
                user={story.user!}
                hasStory={true}
                isViewed={story.is_viewed}
                className="flex-shrink-0"
              />
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Feed */}
      <main className="max-w-md mx-auto">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No posts yet</div>
            <Link href="/search" className="text-blue-500 font-semibold">
              Find people to follow
            </Link>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} onLike={handleLike} onComment={handleComment} />)
        )}
      </main>

      <MobileNav />
    </div>
  )
}
