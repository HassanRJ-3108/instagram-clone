import { supabase } from "./supabase"
import type { User, Post, Story, Message, Conversation } from "./types"

// User API
export const userApi = {
  async getCurrentUser(clerkId: string): Promise<User | null> {
    const { data, error } = await supabase.from("users").select("*").eq("clerk_id", clerkId).single()

    if (error) {
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
}

// Posts API
export const postsApi = {
  async getFeedPosts(userId: string, page = 0, limit = 10): Promise<Post[]> {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        user:users(*),
        is_liked:likes!inner(user_id)
      `)
      .order("created_at", { ascending: false })
      .range(page * limit, (page + 1) * limit - 1)

    if (error) {
      console.error("Error fetching feed posts:", error)
      return []
    }

    return (
      data?.map((post) => ({
        ...post,
        is_liked: post.is_liked?.some((like: any) => like.user_id === userId) || false,
      })) || []
    )
  },

  async createPost(userId: string, imageUrl: string, caption?: string): Promise<Post | null> {
    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_id: userId,
        image_url: imageUrl,
        caption,
      })
      .select(`
        *,
        user:users(*)
      `)
      .single()

    if (error) {
      console.error("Error creating post:", error)
      return null
    }

    // Update user's posts count
    await supabase.rpc("increment_posts_count", { user_id: userId })

    return data
  },

  async likePost(userId: string, postId: string): Promise<boolean> {
    const { error } = await supabase.from("likes").insert({ user_id: userId, post_id: postId })

    if (!error) {
      await supabase.rpc("increment_post_likes", { post_id: postId })
    }

    return !error
  },

  async unlikePost(userId: string, postId: string): Promise<boolean> {
    const { error } = await supabase.from("likes").delete().eq("user_id", userId).eq("post_id", postId)

    if (!error) {
      await supabase.rpc("decrement_post_likes", { post_id: postId })
    }

    return !error
  },
}

// Stories API
export const storiesApi = {
  async getActiveStories(): Promise<Story[]> {
    const { data, error } = await supabase
      .from("stories")
      .select(`
        *,
        user:users(*)
      `)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching stories:", error)
      return []
    }
    return data || []
  },

  async createStory(userId: string, imageUrl?: string, videoUrl?: string, textContent?: string): Promise<Story | null> {
    const { data, error } = await supabase
      .from("stories")
      .insert({
        user_id: userId,
        image_url: imageUrl,
        video_url: videoUrl,
        text_content: textContent,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .select(`
        *,
        user:users(*)
      `)
      .single()

    if (error) {
      console.error("Error creating story:", error)
      return null
    }
    return data
  },
}

// Messages API
export const messagesApi = {
  async getConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from("conversations")
      .select(`
        *,
        user1:users!conversations_user1_id_fkey(*),
        user2:users!conversations_user2_id_fkey(*),
        last_message:messages(*)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error fetching conversations:", error)
      return []
    }

    return (
      data?.map((conv) => ({
        ...conv,
        other_user: conv.user1_id === userId ? conv.user2 : conv.user1,
      })) || []
    )
  },

  async getMessages(conversationId: string, page = 0, limit = 50): Promise<Message[]> {
    const { data, error } = await supabase
      .from("messages")
      .select(`
        *,
        sender:users!messages_sender_id_fkey(*)
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .range(page * limit, (page + 1) * limit - 1)

    if (error) {
      console.error("Error fetching messages:", error)
      return []
    }
    return data || []
  },

  async sendMessage(
    senderId: string,
    receiverId: string,
    content: string,
    conversationId?: string,
  ): Promise<Message | null> {
    // Create or get conversation
    let convId = conversationId
    if (!convId) {
      const { data: existingConv } = await supabase
        .from("conversations")
        .select("id")
        .or(
          `and(user1_id.eq.${senderId},user2_id.eq.${receiverId}),and(user1_id.eq.${receiverId},user2_id.eq.${senderId})`,
        )
        .single()

      if (existingConv) {
        convId = existingConv.id
      } else {
        const { data: newConv } = await supabase
          .from("conversations")
          .insert({ user1_id: senderId, user2_id: receiverId })
          .select("id")
          .single()
        convId = newConv?.id
      }
    }

    if (!convId) return null

    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        conversation_id: convId,
      })
      .select(`
        *,
        sender:users!messages_sender_id_fkey(*)
      `)
      .single()

    if (error) {
      console.error("Error sending message:", error)
      return null
    }

    // Update conversation
    await supabase
      .from("conversations")
      .update({
        last_message_id: data.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", convId)

    return data
  },
}
