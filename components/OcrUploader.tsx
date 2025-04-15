"use client"

import type React from "react"

import { useState } from "react"

interface OcrResult {
  output: {
    Fournisseur: string
    date: string
    "name of the company": string
    adresse: string
    "Numéro de facture": string
    "Montant HT": string
    "Montant TVA": string
    "Montant TTC": string
    "Détail de facture": string
  }
}

export default function OcrUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<OcrResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError("Please select a file first")
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      // You can either use the API route or directly call the webhook
      // Option 1: Using our API route
      //const response = await fetch("/api/upload", {
      //  method: "POST",
      //  body: formData,
      //})

      // Option 2: Direct call to webhook (if CORS allows)
      const response = await fetch("https://ocr-sys-u41198.vm.elestio.app/webhook/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Raw response:", data)

      // If the response is an array, use the first item
      const processedResult = Array.isArray(data) ? data : [data]
      console.log("Processed result:", processedResult)

      setResult(processedResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      console.error("Upload error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatNestedText = (text: string) => {
    return text.split("\n").map((line, i) => <div key={i}>{line}</div>)
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="fileInput" className="block text-sm font-medium text-gray-700 mb-2">
            Select Invoice File
          </label>
          <input
            id="fileInput"
            type="file"
            onChange={handleFileChange}
            accept="image/*,.pdf"
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          {file && <p className="mt-2 text-sm text-gray-500">Selected file: {file.name}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading || !file}
          className={`w-full py-2 px-4 rounded-md ${
            isLoading || !file ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"
          } font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        >
          {isLoading ? "Processing..." : "Process Invoice"}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 p-4 rounded-md mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {result && result[0]?.output && (
        <div className="bg-gray-50 p-4 rounded-md shadow">
          <h2 className="text-lg font-semibold mb-4">OCR Results</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Supplier:</h3>
              <div className="mt-1 text-gray-700">{formatNestedText(result[0].output.Fournisseur)}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium">Date:</h3>
                <p className="mt-1 text-gray-700">{result[0].output.date}</p>
              </div>

              <div>
                <h3 className="font-medium">Company:</h3>
                <p className="mt-1 text-gray-700">{result[0].output["name of the company"]}</p>
              </div>

              <div>
                <h3 className="font-medium">Address:</h3>
                <p className="mt-1 text-gray-700">{result[0].output.adresse}</p>
              </div>

              <div>
                <h3 className="font-medium">Invoice Number:</h3>
                <p className="mt-1 text-gray-700">{result[0].output["Numéro de facture"]}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-medium">Amount (excl. tax):</h3>
                <p className="mt-1 text-gray-700">{result[0].output["Montant HT"]}</p>
              </div>

              <div>
                <h3 className="font-medium">VAT Amount:</h3>
                <p className="mt-1 text-gray-700">{result[0].output["Montant TVA"]}</p>
              </div>

              <div>
                <h3 className="font-medium">Total Amount:</h3>
                <p className="mt-1 text-gray-700">{result[0].output["Montant TTC"]}</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium">Invoice Details:</h3>
              <div className="mt-1 text-gray-700">{formatNestedText(result[0].output["Détail de facture"])}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
