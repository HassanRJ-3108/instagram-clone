"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { ArrowLeft, MoreHorizontal, Grid, Bookmark } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { userApi } from "@/lib/api"
import type { User, Post } from "@/lib/types"
import Image from "next/image"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function UserProfilePage() {
  const params = useParams()
  const { user: clerkUser } = useUser()
  const username = params.username as string

  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    if (clerkUser && username) {
      fetchUserData()
    }
  }, [clerkUser, username])

  const fetchUserData = async () => {
    if (!clerkUser) return

    try {
      // Get current user and target user
      const [current, users] = await Promise.all([userApi.getCurrentUser(clerkUser.id), userApi.searchUsers(username)])

      const targetUser = users.find((u) => u.username === username)

      if (!targetUser) {
        // User not found
        setLoading(false)
        return
      }

      setCurrentUser(current)
      setUserProfile(targetUser)

      // Check if following
      if (current) {
        const { data } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", current.id)
          .eq("following_id", targetUser.id)
          .single()

        setIsFollowing(!!data)
      }

      // Fetch user posts
      const { data: postsData } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", targetUser.id)
        .order("created_at", { ascending: false })

      setPosts(postsData || [])
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!currentUser || !userProfile) return

    if (isFollowing) {
      await userApi.unfollowUser(currentUser.id, userProfile.id)
      setIsFollowing(false)
      setUserProfile((prev) => (prev ? { ...prev, followers_count: prev.followers_count - 1 } : null))
    } else {
      await userApi.followUser(currentUser.id, userProfile.id)
      setIsFollowing(true)
      setUserProfile((prev) => (prev ? { ...prev, followers_count: prev.followers_count + 1 } : null))
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="max-w-2xl mx-auto min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">User not found</h1>
          <p className="text-gray-500 mb-4">The user @{username} doesn't exist</p>
          <Link href="/search">
            <Button>Find other users</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <Link href="/search">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">{userProfile.username}</h1>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-6 w-6" />
          </Button>
        </div>
      </header>

      <main>
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
                  <div className="font-semibold text-lg">{posts.length}</div>
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
            {currentUser?.id === userProfile.id ? (
              <>
                <Button variant="outline" className="flex-1 bg-transparent">
                  Edit profile
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  Share profile
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleFollow}
                  className={`flex-1 ${isFollowing ? "bg-gray-200 text-black hover:bg-gray-300" : "bg-blue-500 text-white hover:bg-blue-600"}`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
                <Link href={`/messages/${userProfile.username}`} className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    Message
                  </Button>
                </Link>
              </>
            )}
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
                {currentUser?.id === userProfile.id && (
                  <Link href="/create" className="text-blue-500 font-semibold">
                    Share your first photo
                  </Link>
                )}
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
    </div>
  )
}
