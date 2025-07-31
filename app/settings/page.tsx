import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto min-h-screen bg-white">
      <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center px-4 py-3">
          <Link href="/profile">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold ml-4">Settings</h1>
        </div>
      </header>
      <main className="p-4 text-center">
        <h2 className="text-xl font-bold mb-4">Settings Page</h2>
        <p className="text-gray-600 mb-6">Account settings, privacy options, and more will be available here soon.</p>
        <Link href="/profile">
          <Button>Back to Profile</Button>
        </Link>
      </main>
    </div>
  )
}
