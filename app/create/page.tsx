"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageUpload } from "@/components/image-upload"
import { postsApi, userApi } from "@/lib/api"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { toast } from "sonner"

export default function CreatePage() {
  const { user } = useUser()
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>("")
  const [caption, setCaption] = useState("")
  const [isPosting, setIsPosting] = useState(false)

  const handleImageSelect = (file: File, previewUrl: string) => {
    setSelectedFile(file)
    setPreview(previewUrl)
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    setPreview("")
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
      const filePath = `posts/${fileName}`

      const { error: uploadError } = await supabase.storage.from("images").upload(filePath, file)

      if (uploadError) {
        console.error("Upload error:", uploadError)
        return null
      }

      const { data } = supabase.storage.from("images").getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error("Error uploading image:", error)
      return null
    }
  }

  const handlePost = async () => {
    if (!selectedFile || !user) return

    setIsPosting(true)
    try {
      // Get current user from database
      const currentUser = await userApi.getCurrentUser(user.id)
      if (!currentUser) {
        toast.error("User not found")
        return
      }

      // Upload image
      const imageUrl = await uploadImage(selectedFile)
      if (!imageUrl) {
        toast.error("Failed to upload image")
        return
      }

      // Create post
      const post = await postsApi.createPost(currentUser.id, imageUrl, caption)
      if (post) {
        toast.success("Post created successfully!")
        router.push("/")
      } else {
        toast.error("Failed to create post")
      }
    } catch (error) {
      console.error("Error creating post:", error)
      toast.error("Something went wrong")
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">New post</h1>
          </div>
          <Button
            onClick={handlePost}
            disabled={!selectedFile || isPosting}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6"
          >
            {isPosting ? "Posting..." : "Share"}
          </Button>
        </div>
      </header>

      <main className="p-4">
        {!preview ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold mb-2">Share a photo</h2>
                <p className="text-gray-500">When you share photos, they'll appear on your profile.</p>
              </div>

              <ImageUpload onImageSelect={handleImageSelect} className="w-full" />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Preview */}
            <ImageUpload
              preview={preview}
              onRemove={handleRemoveImage}
              onImageSelect={handleImageSelect}
              className="w-full"
            />

            {/* User info and caption */}
            <div className="flex items-start space-x-3">
              <Avatar className="h-10 w-10 mt-1">
                <AvatarImage src={user?.imageUrl || "/placeholder.svg"} />
                <AvatarFallback>{user?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="font-semibold text-sm mb-2">{user?.username}</div>
                <Textarea
                  placeholder="Write a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="border-none p-0 resize-none focus-visible:ring-0 text-sm min-h-[100px]"
                  rows={4}
                />
              </div>
            </div>

            {/* Additional options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-t border-gray-200">
                <span className="text-sm">Add location</span>
                <Button variant="ghost" size="sm" className="text-blue-500">
                  Add
                </Button>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-gray-200">
                <span className="text-sm">Tag people</span>
                <Button variant="ghost" size="sm" className="text-blue-500">
                  Tag
                </Button>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-gray-200">
                <span className="text-sm">Add to story</span>
                <Button variant="ghost" size="sm" className="text-blue-500">
                  Add
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
