import { ImageAnnotatorClient } from "@google-cloud/vision"
import fs from "fs"
import path from "path"
import NodeCache from "node-cache"
import { config } from "../config"
import { cleanupTempFile } from "../middleware/file-upload"
import { extractInvoiceData, type InvoiceData } from "./invoice-parser"

// Initialize Google Vision client
const visionClient = new ImageAnnotatorClient()

// Initialize cache
const ocrCache = new NodeCache({
  stdTTL: config.cache.ttl, // Time to live in seconds
  checkperiod: 120, // Check for expired keys every 2 minutes
})

// Process image with OCR
export async function processImageWithOCR(filePath: string): Promise<string> {
  try {
    // Check if result is cached (using file hash as key)
    const fileHash = await getFileHash(filePath)
    const cachedResult = ocrCache.get<string>(fileHash)

    if (cachedResult) {
      console.log("OCR result found in cache")
      return cachedResult
    }

    // Determine if file is PDF or image
    const fileExt = path.extname(filePath).toLowerCase()
    let textDetectionResult

    if (fileExt === ".pdf") {
      // For PDFs, use document text detection
      const [result] = await visionClient.documentTextDetection(filePath)
      textDetectionResult = result.fullTextAnnotation?.text || ""
    } else {
      // For images, use text detection
      const [result] = await visionClient.textDetection(filePath)
      textDetectionResult = result.fullTextAnnotation?.text || ""
    }

    // Cache the result
    ocrCache.set(fileHash, textDetectionResult)

    return textDetectionResult
  } catch (error) {
    console.error("Error processing image with OCR:", error)
    throw new Error("Failed to process image with OCR")
  }
}

// Process invoice image and extract structured data
export async function processInvoice(filePath: string): Promise<InvoiceData> {
  try {
    // Extract text from image using OCR
    const extractedText = await processImageWithOCR(filePath)

    // Parse the extracted text to get structured invoice data
    const invoiceData = extractInvoiceData(extractedText)

    // Clean up the temporary file
    cleanupTempFile(filePath)

    return invoiceData
  } catch (error) {
    // Clean up the temporary file even if processing fails
    cleanupTempFile(filePath)

    console.error("Error processing invoice:", error)
    throw error
  }
}

// Helper function to get file hash for caching
async function getFileHash(filePath: string): Promise<string> {
  const crypto = require("crypto")
  const fileBuffer = fs.readFileSync(filePath)
  const hashSum = crypto.createHash("sha256")
  hashSum.update(fileBuffer)
  return hashSum.digest("hex")
}

