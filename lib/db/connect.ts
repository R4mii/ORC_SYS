import mongoose from "mongoose"
import { config } from "../config"

// Track connection status
let isConnected = false

// Connect to MongoDB
export async function connectToDatabase() {
  if (isConnected) {
    return
  }

  try {
    const db = await mongoose.connect(config.database.url)

    isConnected = !!db.connections[0].readyState

    console.log("MongoDB connected successfully")
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw error
  }
}

// Disconnect from MongoDB (useful for testing)
export async function disconnectFromDatabase() {
  if (!isConnected) {
    return
  }

  try {
    await mongoose.disconnect()
    isConnected = false
    console.log("MongoDB disconnected successfully")
  } catch (error) {
    console.error("MongoDB disconnection error:", error)
    throw error
  }
}
