export interface User {
  id: string
  clerk_id: string
  username: string
  email: string
  full_name?: string
  bio?: string
  avatar_url?: string
  is_verified: boolean
  is_private: boolean
  followers_count: number
  following_count: number
  posts_count: number
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  user_id: string
  caption?: string
  image_url: string
  likes_count: number
  comments_count: number
  created_at: string
  updated_at: string
  user?: User
  is_liked?: boolean
}

export interface Story {
  id: string
  user_id: string
  image_url?: string
  video_url?: string
  text_content?: string
  background_color: string
  expires_at: string
  views_count: number
  created_at: string
  user?: User
  is_viewed?: boolean
}

export interface Comment {
  id: string
  user_id: string
  post_id: string
  content: string
  likes_count: number
  created_at: string
  updated_at: string
  user?: User
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content?: string
  image_url?: string
  is_read: boolean
  created_at: string
  sender?: User
  receiver?: User
}

export interface Conversation {
  id: string
  user1_id: string
  user2_id: string
  last_message_id?: string
  updated_at: string
  other_user?: User
  last_message?: Message
}
