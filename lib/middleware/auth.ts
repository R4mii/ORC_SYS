import type { NextApiRequest, NextApiResponse } from "next"
import jwt from "jsonwebtoken"
import { config } from "../config"

// Interface for decoded JWT token
interface DecodedToken {
  userId: string
  role: string
  iat: number
  exp: number
}

// Middleware to verify JWT token
export const authMiddleware = (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" })
    }

    const token = authHeader.split(" ")[1]

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as DecodedToken

    // Add user info to request
    ;(req as any).user = {
      userId: decoded.userId,
      role: decoded.role,
    }

    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Invalid token" })
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Token expired" })
    }

    console.error("Auth middleware error:", error)
    return res.status(500).json({ error: "Authentication error" })
  }
}

// Role-based authorization middleware
export const authorizeRoles = (...roles: string[]) => {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const user = (req as any).user

    if (!user) {
      return res.status(401).json({ error: "Authentication required" })
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" })
    }

    next()
  }
}
