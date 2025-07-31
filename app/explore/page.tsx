import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ExplorePage() {
  return (
    <div className="max-w-2xl mx-auto min-h-screen bg-white flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-2xl font-bold mb-4">Explore Coming Soon!</h1>
      <p className="text-gray-600 mb-6">This page will feature trending posts, new accounts to follow, and more.</p>
      <Link href="/">
        <Button>Go to Home</Button>
      </Link>
    </div>
  )
}
