"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { StoryRing } from "@/components/story-ring"
import { PostCard } from "@/components/post-card"
import { postsApi, storiesApi, userApi } from "@/lib/api"
import type { Post, Story, User } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Camera, Heart } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user: clerkUser } = useUser()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    if (clerkUser) {
      initializeUser()
      fetchFeedData()
    }
  }, [clerkUser])

  const initializeUser = async () => {
    if (!clerkUser) return

    const user = await userApi.getCurrentUser(clerkUser.id)
    setCurrentUser(user)
  }

  const fetchFeedData = async (pageNum = 0) => {
    if (!currentUser) return

    try {
      const [postsData, storiesData] = await Promise.all([
        postsApi.getFeedPosts(currentUser.id, pageNum),
        pageNum === 0 ? storiesApi.getActiveStories() : [],
      ])

      if (pageNum === 0) {
        setPosts(postsData)
        setStories(storiesData)
      } else {
        setPosts((prev) => [...prev, ...postsData])
      }

      setHasMore(postsData.length === 10)
    } catch (error) {
      console.error("Error fetching feed data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId: string) => {
    if (!currentUser) return

    const post = posts.find((p) => p.id === postId)
    if (!post) return

    const isLiked = post.is_liked

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              is_liked: !isLiked,
              likes_count: isLiked ? p.likes_count - 1 : p.likes_count + 1,
            }
          : p,
      ),
    )

    // API call
    if (isLiked) {
      await postsApi.unlikePost(currentUser.id, postId)
    } else {
      await postsApi.likePost(currentUser.id, postId)
    }
  }

  const handleComment = (postId: string) => {
    // Navigate to post detail page or open comment modal
    console.log("Comment on post:", postId)
  }

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchFeedData(nextPage)
    }
  }

  if (loading && posts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 mb-4"></div>
          <div className="h-20 bg-gray-200 mb-4"></div>
          <div className="h-96 bg-gray-200 mb-4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Mobile Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-40 lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="text-2xl font-bold instagram-gradient bg-clip-text text-transparent">
            Instagram
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/notifications">
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
      <main>
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No posts yet</div>
            <Link href="/search" className="text-blue-500 font-semibold">
              Find people to follow
            </Link>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onLike={handleLike} onComment={handleComment} />
            ))}

            {hasMore && (
              <div className="text-center py-4">
                <button onClick={loadMore} className="text-blue-500 font-semibold" disabled={loading}>
                  {loading ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
