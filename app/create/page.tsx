"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { ArrowLeft, ImageIcon, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageUpload } from "@/components/image-upload"
import { postsApi, storiesApi, userApi } from "@/lib/api"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CreatePage() {
  const { user } = useUser()
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>("")
  const [caption, setCaption] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState("post") // "post" or "story"

  const handleImageSelect = (file: File, previewUrl: string) => {
    setSelectedFile(file)
    setPreview(previewUrl)
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    setPreview("")
    setCaption("") // Clear caption when image is removed
  }

  const uploadFileToSupabase = async (file: File, bucket: string, folder: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
      const filePath = `${folder}/${fileName}`

      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file)

      if (uploadError) {
        console.error("Upload error:", uploadError)
        return null
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error("Error uploading file:", error)
      return null
    }
  }

  const handleCreateContent = async () => {
    if (!selectedFile || !user) return

    setIsCreating(true)
    try {
      const currentUser = await userApi.getCurrentUser(user.id)
      if (!currentUser) {
        toast.error("User not found")
        return
      }

      let success = false
      let redirectPath = "/"

      if (activeTab === "post") {
        const imageUrl = await uploadFileToSupabase(selectedFile, "images", "posts")
        if (!imageUrl) {
          toast.error("Failed to upload post image")
          return
        }
        const post = await postsApi.createPost(currentUser.id, imageUrl, caption)
        success = !!post
        redirectPath = "/"
      } else if (activeTab === "story") {
        const imageUrl = await uploadFileToSupabase(selectedFile, "images", "stories")
        if (!imageUrl) {
          toast.error("Failed to upload story image")
          return
        }
        const story = await storiesApi.createStory(currentUser.id, imageUrl, undefined, caption)
        success = !!story
        redirectPath = "/" // Or to stories page if available
      }

      if (success) {
        toast.success(`${activeTab === "post" ? "Post" : "Story"} created successfully!`)
        handleRemoveImage() // Clear form after successful creation
        router.push(redirectPath)
      } else {
        toast.error(`Failed to create ${activeTab === "post" ? "post" : "story"}`)
      }
    } catch (error) {
      console.error(`Error creating ${activeTab === "post" ? "post" : "story"}:`, error)
      toast.error("Something went wrong")
    } finally {
      setIsCreating(false)
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
            <h1 className="text-xl font-semibold">New {activeTab === "post" ? "post" : "story"}</h1>
          </div>
          <Button
            onClick={handleCreateContent}
            disabled={!selectedFile || isCreating}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6"
          >
            {isCreating ? "Creating..." : "Share"}
          </Button>
        </div>
      </header>

      <main className="p-4">
        {!preview ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold mb-2">Create new</h2>
                <p className="text-gray-500">Choose to share a photo/video as a post or a story.</p>
              </div>

              <Tabs defaultValue="post" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="post">
                    <ImageIcon className="h-4 w-4 mr-2" /> Post
                  </TabsTrigger>
                  <TabsTrigger value="story">
                    <Sparkles className="h-4 w-4 mr-2" /> Story
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="post" className="mt-6">
                  <ImageUpload onImageSelect={handleImageSelect} className="w-full" />
                </TabsContent>
                <TabsContent value="story" className="mt-6">
                  <ImageUpload onImageSelect={handleImageSelect} className="w-full" />
                </TabsContent>
              </Tabs>
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
                  placeholder={`Write a caption for your ${activeTab}...`}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="border-none p-0 resize-none focus-visible:ring-0 text-sm min-h-[100px]"
                  rows={4}
                />
              </div>
            </div>

            {/* Additional options - mostly placeholders for now */}
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-t border-gray-200">
                <span className="text-sm">Add location</span>
                <Button variant="ghost" size="sm" className="text-blue-500" disabled>
                  Add
                </Button>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-gray-200">
                <span className="text-sm">Tag people</span>
                <Button variant="ghost" size="sm" className="text-blue-500" disabled>
                  Tag
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
