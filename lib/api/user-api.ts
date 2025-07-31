import { supabase } from "../supabase"
import type { User } from "../types"

export const userApi = {
  async getCurrentUser(clerkId: string): Promise<User | null> {
    const { data, error } = await supabase.from("users").select("*").eq("clerk_id", clerkId).single()

    if (error) {
      if (error.code === "PGRST116") {
        // User not found - this is okay, will be created by webhook
        return null
      }
      console.error("Error fetching current user:", error)
      return null
    }
    return data
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      console.error("Error updating user:", error)
      return null
    }
    return data
  },

  async searchUsers(query: string): Promise<User[]> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(20)

    if (error) {
      console.error("Error searching users:", error)
      return []
    }
    return data || []
  },

  async followUser(followerId: string, followingId: string): Promise<boolean> {
    const { error } = await supabase.from("follows").insert({ follower_id: followerId, following_id: followingId })

    if (!error) {
      // Update follower counts
      await Promise.all([
        supabase.rpc("increment_following_count", { user_id: followerId }),
        supabase.rpc("increment_followers_count", { user_id: followingId }),
      ])
    }

    return !error
  },

  async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("following_id", followingId)

    if (!error) {
      // Update follower counts
      await Promise.all([
        supabase.rpc("decrement_following_count", { user_id: followerId }),
        supabase.rpc("decrement_followers_count", { user_id: followingId }),
      ])
    }

    return !error
  },

  async getUserByUsername(username: string): Promise<User | null> {
    const { data, error } = await supabase.from("users").select("*").eq("username", username).single()

    if (error) {
      console.error("Error fetching user by username:", error)
      return null
    }
    return data
  },

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", followerId)
      .eq("following_id", followingId)
      .single()

    return !error && !!data
  },
}
