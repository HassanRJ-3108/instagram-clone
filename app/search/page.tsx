"use client"

import { useState, useEffect } from "react"
import { SearchIcon, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/mobile-nav"
import { supabase } from "@/lib/supabase"
import type { User } from "@/lib/types"
import Link from "next/link"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [recentSearches, setRecentSearches] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsers()
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const searchUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
        .limit(20)

      if (error) throw error
      setSearchResults(data || [])
    } catch (error) {
      console.error("Error searching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
  }

  return (
    <div className="min-h-screen bg-white pb-12 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center px-4 py-3 space-x-3">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 bg-gray-100 border-none rounded-lg"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        {searchQuery ? (
          <div className="p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Search Results</h2>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 animate-pulse">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No results found for "{searchQuery}"</div>
            ) : (
              <div className="space-y-3">
                {searchResults.map((user) => (
                  <Link
                    key={user.id}
                    href={`/profile/${user.username}`}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={
                          user.avatar_url ||
                          `/placeholder.svg?height=48&width=48&text=${user.username[0].toUpperCase()}`
                        }
                      />
                      <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1">
                        <p className="font-semibold text-sm truncate">{user.username}</p>
                        {user.is_verified && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm truncate">{user.full_name}</p>
                      <p className="text-gray-400 text-xs">{user.followers_count} followers</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Recent</h2>
            {recentSearches.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No recent searches</div>
            ) : (
              <div className="space-y-3">
                {recentSearches.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <Link href={`/profile/${user.username}`} className="flex items-center space-x-3 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={
                            user.avatar_url ||
                            `/placeholder.svg?height=48&width=48&text=${user.username[0].toUpperCase()}`
                          }
                        />
                        <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{user.username}</p>
                        <p className="text-gray-500 text-sm truncate">{user.full_name}</p>
                      </div>
                    </Link>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  )
}
