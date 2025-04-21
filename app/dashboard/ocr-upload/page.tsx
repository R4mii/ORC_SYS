"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UploadCloud } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function OcrUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    setError(null)
  }

  const handleSubmit = async () => {
    if (!file) return
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("invoice1", file)

    try {
      const response = await fetch("https://primary-production-14c1.up.railway.app/webhook/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`)
      }

      const data = await response.json()
      console.log("OCR Response:", data)
      setResult(data)
    } catch (err) {
      console.error("Upload error:", err)
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>OCR Document Upload</CardTitle>
          <CardDescription>Upload an invoice for OCR processing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Input type="file" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" disabled={loading} />
              <p className="text-sm text-gray-500 mt-1">Supported formats: PDF, JPG, PNG</p>
            </div>

            <Button onClick={handleSubmit} disabled={loading || !file} className="w-full">
              <UploadCloud className="mr-2 h-4 w-4" />
              {loading ? "Processing..." : "Upload Document"}
            </Button>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            {result && (
              <div className="mt-6">
                <h3 className="font-medium mb-2">Aperçu:</h3>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-[500px] text-sm">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
