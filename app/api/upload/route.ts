import { NextResponse } from "next/server"
import { processInvoiceImage } from "@/lib/ocr"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to ArrayBuffer
    const buffer = await file.arrayBuffer()

    // Process the image with OCR
    const ocrResult = await processInvoiceImage(buffer)

    // Create a URL for the uploaded file
    // In a real app, you would save this to a storage service like Vercel Blob Storage
    // For demo purposes, we'll use a data URL
    const fileReader = new FileReader()
    const fileDataPromise = new Promise((resolve) => {
      fileReader.onloadend = () => resolve(fileReader.result)
      fileReader.readAsDataURL(file)
    })

    const fileData = await fileDataPromise

    // Return the OCR results and file URL
    return NextResponse.json({
      ...ocrResult,
      fileUrl: fileData,
      fileName: file.name,
    })
  } catch (error) {
    console.error("Error processing file:", error)
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 })
  }
}

