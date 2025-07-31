"use client"

import type React from "react"

import { useRef } from "react"
import { Camera, ImageIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface ImageUploadProps {
  onImageSelect: (file: File, preview: string) => void
  onRemove?: () => void
  preview?: string
  className?: string
  multiple?: boolean
}

export function ImageUpload({ onImageSelect, onRemove, preview, className, multiple = false }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        onImageSelect(file, result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        onImageSelect(file, result)
      }
      reader.readAsDataURL(file)
    }
  }

  if (preview) {
    return (
      <div className={cn("relative", className)}>
        <div className="relative aspect-square rounded-lg overflow-hidden">
          <Image src={preview || "/placeholder.svg"} alt="Selected image" fill className="object-cover" />
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        multiple={multiple}
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
      />

      <div className="flex flex-col space-y-3 w-full">
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Select from gallery
        </Button>

        <Button onClick={() => cameraInputRef.current?.click()} variant="outline" className="w-full">
          <Camera className="h-4 w-4 mr-2" />
          Take photo
        </Button>
      </div>
    </div>
  )
}
