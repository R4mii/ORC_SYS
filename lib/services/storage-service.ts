import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

const bucketName = process.env.AWS_S3_BUCKET || "my-invoice-bucket"

// Upload file to S3
export async function uploadFileToS3(filePath: string, contentType: string): Promise<string> {
  try {
    // Generate a unique key for the file
    const fileExtension = path.extname(filePath)
    const key = `invoices/${uuidv4()}${fileExtension}`

    // Read file content
    const fileContent = fs.readFileSync(filePath)

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileContent,
      ContentType: contentType,
    })

    await s3Client.send(command)

    // Return the S3 key
    return key
  } catch (error) {
    console.error("Error uploading file to S3:", error)
    throw new Error("Failed to upload file to storage")
  }
}

// Get a signed URL for accessing a file
export async function getSignedFileUrl(key: string, expiresIn = 3600): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    })

    // Generate a signed URL that expires after the specified time
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn })

    return signedUrl
  } catch (error) {
    console.error("Error generating signed URL:", error)
    throw new Error("Failed to generate file access URL")
  }
}

// Delete a file from S3
export async function deleteFileFromS3(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })

    await s3Client.send(command)
  } catch (error) {
    console.error("Error deleting file from S3:", error)
    throw new Error("Failed to delete file from storage")
  }
}
