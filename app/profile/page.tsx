"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Settings, Grid, Bookmark, UserPlus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MobileNav } from "@/components/mobile-nav"
import type { User, Post } from "@/lib/types"
import Image from "next/image"
import Link from "next/link"

export default function ProfilePage() {
  const { user: clerkUser } = useUser()
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (clerkUser) {
      fetchUserProfile()
      fetchUserPosts()
    }
  }, [clerkUser])

  const fetchUserProfile = async () => {
    try {
      // Mock user profile data
      const mockProfile: User = {
        id: "user-1",
        clerk_id: clerkUser?.id || "",
        username: clerkUser?.username || "user",
        email: clerkUser?.emailAddresses[0]?.emailAddress || "",
        full_name: clerkUser?.fullName || "",
        bio: "Living life to the fullest ✨\n📍 New York City\n🎨 Digital Creator",
        avatar_url: clerkUser?.imageUrl,
        is_verified: false,
        is_private: false,
        followers_count: 1234,
        following_count: 567,
        posts_count: 89,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setUserProfile(mockProfile)
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  const fetchUserPosts = async () => {
    try {
      // Mock posts data
      const mockPosts: Post[] = Array.from({ length: 12 }, (_, i) => ({
        id: `post-${i + 1}`,
        user_id: "user-1",
        caption: `Post ${i + 1} caption`,
        image_url: `/placeholder.svg?height=300&width=300&text=Post${i + 1}`,
        likes_count: Math.floor(Math.random() * 1000),
        comments_count: Math.floor(Math.random() * 100),
        created_at: new Date(Date.now() - i * 86400000).toISOString(),
        updated_at: new Date(Date.now() - i * 86400000).toISOString(),
      }))

      setPosts(mockPosts)
    } catch (error) {
      console.error("Error fetching user posts:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen bg-white">
        <div className="animate-pulse p-4">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-20 w-20 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200"></div>
            ))}
          </div>
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
          <h1 className="text-xl font-semibold">{userProfile.username}</h1>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <UserPlus className="h-6 w-6" />
            </Button>
            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        {/* Profile Info */}
        <div className="p-4">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={
                  userProfile.avatar_url ||
                  `/placeholder.svg?height=80&width=80&text=${userProfile.username[0].toUpperCase()}`
                }
              />
              <AvatarFallback className="text-2xl">{userProfile.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center space-x-6 mb-2">
                <div className="text-center">
                  <div className="font-semibold text-lg">{userProfile.posts_count}</div>
                  <div className="text-gray-500 text-sm">posts</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">{userProfile.followers_count.toLocaleString()}</div>
                  <div className="text-gray-500 text-sm">followers</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">{userProfile.following_count}</div>
                  <div className="text-gray-500 text-sm">following</div>
                </div>
              </div>
            </div>
          </div>

          {/* Name and Bio */}
          <div className="mb-4">
            <div className="flex items-center space-x-1 mb-1">
              <h2 className="font-semibold">{userProfile.full_name}</h2>
              {userProfile.is_verified && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            {userProfile.bio && <p className="text-sm whitespace-pre-line">{userProfile.bio}</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 mb-6">
            <Button variant="outline" className="flex-1 bg-transparent">
              Edit profile
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              Share profile
            </Button>
          </div>
        </div>

        {/* Posts Grid */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-transparent border-t border-gray-200">
            <TabsTrigger
              value="posts"
              className="data-[state=active]:border-t-2 data-[state=active]:border-black rounded-none"
            >
              <Grid className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="data-[state=active]:border-t-2 data-[state=active]:border-black rounded-none"
            >
              <Bookmark className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-0">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">No posts yet</div>
                <Link href="/create" className="text-blue-500 font-semibold">
                  Share your first photo
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {posts.map((post) => (
                  <Link key={post.id} href={`/post/${post.id}`} className="aspect-square relative group">
                    <Image
                      src={post.image_url || "/placeholder.svg"}
                      alt={post.caption || "Post"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 33vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-semibold">{post.likes_count}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-semibold">{post.comments_count}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="mt-0">
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">No saved posts</div>
              <p className="text-sm text-gray-400">Posts you save will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <MobileNav />
    </div>
  )
}
