"use client"

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
      const response = await fetch("https://n8n-0ku3a-u40684.vm.elestio.app/webhook/upload", {
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

  const formatNestedText = (text: string) => {
    if (!text) return null
    return text.split(/\n|<br>/).map((line, i) => (
      <div key={i} className="py-1">
        {line.trim()}
      </div>
    ))
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
              <Input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                disabled={loading}
              />
              <p className="text-sm text-gray-500 mt-1">
                Supported formats: PDF, JPG, PNG
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading || !file}
              className="w-full"
            >
              <UploadCloud className="mr-2 h-4 w-4" />
              {loading ? "Processing..." : "Upload Document"}
            </Button>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            {result && result[0]?.output && (
              <div className="mt-6 space-y-4">
                <h3 className="font-medium">Extracted Data:</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div>
                    <span className="font-medium">Fournisseur:</span>
                    <div className="text-gray-700">
                      {formatNestedText(result[0].output.Fournisseur)}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Date:</span>
                    <div className="text-gray-700">{result[0].output.date}</div>
                  </div>
                  <div>
                    <span className="font-medium">Company:</span>
                    <div className="text-gray-700">
                      {result[0].output["name of the company"]}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Invoice Number:</span>
                    <div className="text-gray-700">
                      {result[0].output["Numéro de facture"]}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Amount (HT):</span>
                    <div className="text-gray-700">
                      {result[0].output["Montant HT"]}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">TVA:</span>
                    <div className="text-gray-700">
                      {result[0].output["Montant TVA"]}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Total (TTC):</span>
                    <div className="text-gray-700">
                      {result[0].output["Montant TTC"]}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Details:</span>
                    <div className="text-gray-700">
                      {formatNestedText(result[0].output[" Détail de facture"])}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
