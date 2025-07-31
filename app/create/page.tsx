"use client"

import type React from "react"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { ArrowLeft, ImageIcon, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MobileNav } from "@/components/mobile-nav"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function CreatePage() {
  const { user } = useUser()
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [caption, setCaption] = useState("")
  const [isPosting, setIsPosting] = useState(false)

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePost = async () => {
    if (!selectedImage) return

    setIsPosting(true)
    try {
      // Here you would upload the image and create the post
      // For now, we'll just simulate the process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Navigate back to home after posting
      router.push("/")
    } catch (error) {
      console.error("Error creating post:", error)
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white pb-12 md:pb-0">
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
            disabled={!selectedImage || isPosting}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6"
          >
            {isPosting ? "Posting..." : "Share"}
          </Button>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        {!selectedImage ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <ImageIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Share a photo</h2>
            <p className="text-gray-500 text-center mb-8">When you share photos, they'll appear on your profile.</p>

            <div className="space-y-4 w-full max-w-xs">
              <label className="block">
                <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Select from gallery
                </Button>
              </label>

              <Button variant="outline" className="w-full bg-transparent">
                <Camera className="h-4 w-4 mr-2" />
                Take photo
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4">
            {/* Preview */}
            <div className="relative aspect-square mb-4 rounded-lg overflow-hidden">
              <Image src={selectedImage || "/placeholder.svg"} alt="Selected image" fill className="object-cover" />
            </div>

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
                  className="border-none p-0 resize-none focus-visible:ring-0 text-sm"
                  rows={4}
                />
              </div>
            </div>

            {/* Additional options */}
            <div className="mt-6 space-y-4">
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

      <MobileNav />
    </div>
  )
}
