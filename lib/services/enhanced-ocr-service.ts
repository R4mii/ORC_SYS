import { ImageAnnotatorClient } from "@google-cloud/vision"
import fs from "fs"
import path from "path"
import NodeCache from "node-cache"
import { config } from "../config"
import { cleanupTempFile } from "../middleware/file-upload"
import { extractInvoiceData, type InvoiceData } from "./invoice-parser"
import logger from "./logging-service"
import { uploadFileToS3, getSignedFileUrl } from "./storage-service"

// Initialize cache
const ocrCache = new NodeCache({
  stdTTL: config.cache.ttl, // Time to live in seconds
  checkperiod: 120, // Check for expired keys every 2 minutes
})

// Initialize Google Vision client with credentials from environment variable
let visionClient: ImageAnnotatorClient

try {
  // For Vercel deployment, parse the credentials from environment variable
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS && process.env.GOOGLE_APPLICATION_CREDENTIALS.startsWith("{")) {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)
    visionClient = new ImageAnnotatorClient({ credentials })
  } else {
    // For local development, use the path to credentials file
    visionClient = new ImageAnnotatorClient()
  }
} catch (error) {
  logger.error("Failed to initialize Google Vision client:", error)
  throw new Error("Failed to initialize OCR service")
}

// Process image with OCR
export async function processImageWithOCR(
  filePath: string,
  options: {
    useCache?: boolean
    enhanceImage?: boolean
    preferredLanguage?: string
  } = {},
): Promise<string> {
  const { useCache = true, enhanceImage = false, preferredLanguage } = options

  try {
    // Generate a hash of the file for caching
    const fileHash = await getFileHash(filePath)
    const cacheKey = `ocr_${fileHash}_${preferredLanguage || "default"}`

    // Check if result is cached
    if (useCache) {
      const cachedResult = ocrCache.get<string>(cacheKey)
      if (cachedResult) {
        logger.info(`OCR result found in cache for ${path.basename(filePath)}`)
        return cachedResult
      }
    }

    // Preprocess image if needed
    let processedFilePath = filePath
    if (enhanceImage) {
      processedFilePath = await enhanceImageForOCR(filePath)
    }

    // Determine if file is PDF or image
    const fileExt = path.extname(processedFilePath).toLowerCase()
    let textDetectionResult = ""

    // Set up OCR request with language hints if provided
    const requestOptions: any = {}
    if (preferredLanguage) {
      requestOptions.imageContext = {
        languageHints: [preferredLanguage],
      }
    }

    // Process based on file type
    if (fileExt === ".pdf") {
      // For PDFs, use document text detection
      const [result] = await visionClient.documentTextDetection(processedFilePath, requestOptions)
      textDetectionResult = result.fullTextAnnotation?.text || ""

      // If text detection failed or returned little text, try OCR as fallback
      if (textDetectionResult.length < 50) {
        logger.warn(`Document text detection returned little text for ${path.basename(filePath)}, trying OCR`)
        const [ocrResult] = await visionClient.textDetection(processedFilePath, requestOptions)
        textDetectionResult = ocrResult.fullTextAnnotation?.text || textDetectionResult
      }
    } else {
      // For images, use text detection
      const [result] = await visionClient.textDetection(processedFilePath, requestOptions)
      textDetectionResult = result.fullTextAnnotation?.text || ""
    }

    // Clean up processed file if it's different from original
    if (enhanceImage && processedFilePath !== filePath) {
      cleanupTempFile(processedFilePath)
    }

    // Cache the result if it's substantial
    if (useCache && textDetectionResult.length > 10) {
      ocrCache.set(cacheKey, textDetectionResult)
    }

    return textDetectionResult
  } catch (error) {
    logger.error(`Error processing image with OCR: ${path.basename(filePath)}`, error)
    throw new Error("Failed to process image with OCR")
  }
}

// Process invoice image and extract structured data
export async function processInvoice(
  filePath: string,
  options: {
    userId?: string
    companyId?: string
    storeOriginal?: boolean
    enhanceImage?: boolean
    preferredLanguage?: string
  } = {},
): Promise<{
  invoiceData: InvoiceData
  originalFileUrl?: string
  processingTimeMs: number
}> {
  const startTime = Date.now()
  const { userId, companyId, storeOriginal = true, enhanceImage = true, preferredLanguage } = options

  try {
    // Store original file if requested
    let originalFileUrl: string | undefined
    if (storeOriginal) {
      try {
        const fileKey = await uploadFileToS3(
          filePath,
          path.extname(filePath).toLowerCase() === ".pdf" ? "application/pdf" : "image/jpeg",
        )
        originalFileUrl = await getSignedFileUrl(fileKey)
        logger.info(`Original file stored at ${fileKey}`)
      } catch (storageError) {
        logger.error("Failed to store original file:", storageError)
        // Continue processing even if storage fails
      }
    }

    // Extract text from image using OCR
    const extractedText = await processImageWithOCR(filePath, {
      enhanceImage,
      preferredLanguage,
    })

    // Parse the extracted text to get structured invoice data
    const invoiceData = extractInvoiceData(extractedText)

    // Add metadata
    if (userId) invoiceData.metadata = { ...invoiceData.metadata, userId }
    if (companyId) invoiceData.metadata = { ...invoiceData.metadata, companyId }

    // Calculate processing time
    const processingTimeMs = Date.now() - startTime

    // Log success
    logger.info(`Invoice processed successfully in ${processingTimeMs}ms with confidence ${invoiceData.confidence}`)

    return {
      invoiceData,
      originalFileUrl,
      processingTimeMs,
    }
  } catch (error) {
    // Log error
    logger.error(`Error processing invoice: ${path.basename(filePath)}`, error)

    // Clean up the temporary file
    cleanupTempFile(filePath)

    throw error
  } finally {
    // Always clean up the temporary file
    cleanupTempFile(filePath)
  }
}

// Helper function to enhance image for better OCR results
async function enhanceImageForOCR(filePath: string): Promise<string> {
  try {
    // Only process image files, not PDFs
    if (path.extname(filePath).toLowerCase() === ".pdf") {
      return filePath
    }

    // Use sharp for image processing
    const sharp = require("sharp")
    const enhancedFilePath = `${filePath}_enhanced.jpg`

    await sharp(filePath)
      // Convert to grayscale
      .grayscale()
      // Increase contrast
      .normalize()
      // Sharpen the image
      .sharpen()
      // Remove noise
      .median(1)
      // Save as high-quality JPEG
      .jpeg({ quality: 95 })
      .toFile(enhancedFilePath)

    return enhancedFilePath
  } catch (error) {
    logger.error(`Error enhancing image: ${path.basename(filePath)}`, error)
    return filePath // Return original file if enhancement fails
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
