/**
 * File validation utilities for ensuring uploaded files are safe and valid
 */

import { env } from "../env.config"
import { logger } from "../services/logger"

interface FileValidationOptions {
  maxSize?: number
  allowedTypes?: string[]
  allowedExtensions?: string[]
}

interface ValidationResult {
  valid: boolean
  error?: string
}

export function validateFile(file: File, options: FileValidationOptions = {}): ValidationResult {
  const { maxSize = env.upload.maxSize, allowedTypes = env.upload.allowedTypes, allowedExtensions = [] } = options

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024))
    return {
      valid: false,
      error: `File size exceeds the limit of ${maxSizeMB}MB`,
    }
  }

  // Check MIME type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type '${file.type}' is not allowed. Accepted types: ${allowedTypes.join(", ")}`,
    }
  }

  // Check file extension if specified
  if (allowedExtensions.length > 0) {
    const fileExt = `.${file.name.split(".").pop()?.toLowerCase()}`
    if (!allowedExtensions.includes(fileExt)) {
      return {
        valid: false,
        error: `File extension '${fileExt}' is not allowed. Accepted extensions: ${allowedExtensions.join(", ")}`,
      }
    }
  }

  return { valid: true }
}

/**
 * Checks if a file contains valid image data
 * @param file The file to check
 * @returns A promise that resolves to true if the file is a valid image
 */
export function isValidImage(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    // Only validate image MIME types
    if (!file.type.startsWith("image/")) {
      resolve(false)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // If the image loads successfully, it's valid
        resolve(true)
      }
      img.onerror = () => {
        // If the image fails to load, it's not valid
        resolve(false)
      }
      img.src = e.target?.result as string
    }
    reader.onerror = () => resolve(false)
    reader.readAsDataURL(file)
  })
}

/**
 * Validates a PDF file by checking its header
 * @param file The file to check
 * @returns A promise that resolves to true if the file is a valid PDF
 */
export function isValidPdf(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    // Only validate PDF MIME types
    if (file.type !== "application/pdf") {
      resolve(false)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const arr = new Uint8Array(e.target?.result as ArrayBuffer)
      // Check for PDF file signature (%PDF-)
      if (
        arr.length >= 5 &&
        arr[0] === 0x25 && // %
        arr[1] === 0x50 && // P
        arr[2] === 0x44 && // D
        arr[3] === 0x46 && // F
        arr[4] === 0x2d
      ) {
        // -
        resolve(true)
      } else {
        resolve(false)
      }
    }
    reader.onerror = () => resolve(false)
    reader.readAsArrayBuffer(file.slice(0, 5))
  })
}

/**
 * Enhances existing file validation with content validation
 * @param file The file to validate
 * @param options Validation options
 * @returns A promise that resolves to a validation result
 */
export async function validateFileContent(file: File, options: FileValidationOptions = {}): Promise<ValidationResult> {
  // First perform basic validation
  const basicValidation = validateFile(file, options)
  if (!basicValidation.valid) {
    return basicValidation
  }

  try {
    // Additional content-based validation
    if (file.type.startsWith("image/")) {
      const isValid = await isValidImage(file)
      if (!isValid) {
        return {
          valid: false,
          error: "The file does not contain valid image data",
        }
      }
    } else if (file.type === "application/pdf") {
      const isValid = await isValidPdf(file)
      if (!isValid) {
        return {
          valid: false,
          error: "The file does not contain valid PDF data",
        }
      }
    }

    return { valid: true }
  } catch (error) {
    logger.error("Error validating file content", "FileValidation", { file: file.name, error })
    return {
      valid: false,
      error: "Failed to validate file content",
    }
  }
}
