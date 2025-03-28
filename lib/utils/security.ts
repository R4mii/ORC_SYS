import crypto from "crypto"
import { sanitize } from "isomorphic-dompurify"

// Generate a secure random token
export function generateSecureToken(length = 32): string {
  return crypto.randomBytes(length).toString("hex")
}

// Hash a password
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
  return `${salt}:${hash}`
}

// Verify a password against a hash
export function verifyPassword(password: string, hashedPassword: string): boolean {
  const [salt, hash] = hashedPassword.split(":")
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
  return hash === verifyHash
}

// Sanitize user input to prevent XSS attacks
export function sanitizeInput(input: string): string {
  return sanitize(input)
}

// Validate file type
export function isValidFileType(mimeType: string, allowedTypes: string[]): boolean {
  return allowedTypes.includes(mimeType)
}

// Validate file size
export function isValidFileSize(sizeInBytes: number, maxSizeInBytes: number): boolean {
  return sizeInBytes <= maxSizeInBytes
}

// Generate a JWT token
export function generateJwtToken(payload: any, secret: string, expiresIn: string): string {
  const jwt = require("jsonwebtoken")
  return jwt.sign(payload, secret, { expiresIn })
}

// Verify a JWT token
export function verifyJwtToken(token: string, secret: string): any {
  const jwt = require("jsonwebtoken")
  try {
    return jwt.verify(token, secret)
  } catch (error) {
    return null
  }
}

