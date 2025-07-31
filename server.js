const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const cors = require("cors")

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

app.use(cors())
app.use(express.json())

// Store online users
const onlineUsers = new Map()

io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  // Handle user joining
  socket.on("join", (userId) => {
    onlineUsers.set(userId, socket.id)
    socket.userId = userId

    // Notify others that user is online
    socket.broadcast.emit("user_online", userId)
  })

  // Handle sending messages
  socket.on("send_message", (data) => {
    const { receiverId, content, conversationId } = data
    const receiverSocketId = onlineUsers.get(receiverId)

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("new_message", {
        sender_id: socket.userId,
        receiver_id: receiverId,
        content,
        conversation_id: conversationId,
        created_at: new Date().toISOString(),
      })
    }
  })

  // Handle typing indicators
  socket.on("typing_start", (data) => {
    const { conversationId } = data
    socket.to(conversationId).emit("user_typing", {
      conversationId,
      userId: socket.userId,
    })
  })

  socket.on("typing_stop", (data) => {
    const { conversationId } = data
    socket.to(conversationId).emit("user_stop_typing", {
      conversationId,
      userId: socket.userId,
    })
  })

  // Handle joining conversation rooms
  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId)
  })

  // Handle notifications
  socket.on("send_notification", (data) => {
    const { userId, type, message } = data
    const userSocketId = onlineUsers.get(userId)

    if (userSocketId) {
      io.to(userSocketId).emit("new_notification", {
        type,
        message,
        created_at: new Date().toISOString(),
      })
    }
  })

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)

    if (socket.userId) {
      onlineUsers.delete(socket.userId)
      // Notify others that user is offline
      socket.broadcast.emit("user_offline", socket.userId)
    }
  })
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`)
})
