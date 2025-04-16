/**
 * Unit tests for file validation utilities
 */

import { validateFile, isValidImage, isValidPdf } from "@/lib/utils/file-validation"
import { describe, it, expect } from "@jest/globals"

describe("File Validation", () => {
  describe("validateFile", () => {
    it("should accept valid files", () => {
      const file = new File(["test content"], "test.pdf", { type: "application/pdf" })
      const result = validateFile(file, {
        maxSize: 1024 * 1024, // 1MB
        allowedTypes: ["application/pdf"],
      })

      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it("should reject files that exceed the size limit", () => {
      const file = new File(["test content"], "test.pdf", { type: "application/pdf" })
      const result = validateFile(file, {
        maxSize: 5, // 5 bytes
        allowedTypes: ["application/pdf"],
      })

      expect(result.valid).toBe(false)
      expect(result.error).toContain("File size exceeds")
    })

    it("should reject files with disallowed MIME types", () => {
      const file = new File(["test content"], "test.txt", { type: "text/plain" })
      const result = validateFile(file, {
        maxSize: 1024 * 1024,
        allowedTypes: ["application/pdf", "image/jpeg"],
      })

      expect(result.valid).toBe(false)
      expect(result.error).toContain("File type")
    })

    it("should validate file extensions when specified", () => {
      const file = new File(["test content"], "test.png", { type: "image/png" })
      const result = validateFile(file, {
        maxSize: 1024 * 1024,
        allowedTypes: ["image/png"],
        allowedExtensions: [".jpg", ".jpeg"],
      })

      expect(result.valid).toBe(false)
      expect(result.error).toContain("File extension")
    })
  })

  // Note: These tests are simplified as they cannot test actual file content in Jest without mocking
  describe("isValidImage", () => {
    it("should reject non-image files", async () => {
      const file = new File(["test content"], "test.txt", { type: "text/plain" })
      const result = await isValidImage(file)
      expect(result).toBe(false)
    })
  })

  describe("isValidPdf", () => {
    it("should reject non-PDF files", async () => {
      const file = new File(["test content"], "test.txt", { type: "text/plain" })
      const result = await isValidPdf(file)
      expect(result).toBe(false)
    })
  })
})
