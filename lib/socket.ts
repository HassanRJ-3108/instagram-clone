import { io, type Socket } from "socket.io-client"

class SocketService {
  private socket: Socket | null = null

  connect(userId: string) {
    if (!this.socket) {
      this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
        query: { userId },
      })

      this.socket.on("connect", () => {
        console.log("Connected to socket server")
      })

      this.socket.on("disconnect", () => {
        console.log("Disconnected from socket server")
      })
    }
    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // Message events
  sendMessage(data: { receiverId: string; content: string; conversationId: string }) {
    this.socket?.emit("send_message", data)
  }

  onNewMessage(callback: (message: any) => void) {
    this.socket?.on("new_message", callback)
  }

  // Notification events
  onNewNotification(callback: (notification: any) => void) {
    this.socket?.on("new_notification", callback)
  }

  // Typing events
  startTyping(conversationId: string) {
    this.socket?.emit("typing_start", { conversationId })
  }

  stopTyping(conversationId: string) {
    this.socket?.emit("typing_stop", { conversationId })
  }

  onTyping(callback: (data: { conversationId: string; userId: string }) => void) {
    this.socket?.on("user_typing", callback)
  }

  onStopTyping(callback: (data: { conversationId: string; userId: string }) => void) {
    this.socket?.on("user_stop_typing", callback)
  }

  // Online status
  onUserOnline(callback: (userId: string) => void) {
    this.socket?.on("user_online", callback)
  }

  onUserOffline(callback: (userId: string) => void) {
    this.socket?.on("user_offline", callback)
  }
}

export const socketService = new SocketService()
