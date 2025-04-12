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
    " Détail de facture": string
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

      console.log('Uploading file:', file.name)
      const response = await fetch('YOUR_N8N_WEBHOOK_URL', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      console.log('Raw response:', data)
      console.log('Response structure:', {
        isArray: Array.isArray(data),
        hasOutput: data[0]?.output ? 'yes' : 'no',
        firstItem: data[0]
      })
      
      setResult(data)
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatNestedText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        <br />
      </React.Fragment>
    ))
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

      {result && result[0]?.output ? (
        <div className="bg-gray-50 p-4 rounded-md shadow">
          <h2 className="text-lg font-semibold mb-4">Texte extrait</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Fournisseur:</h3>
              <div className="mt-1 text-gray-700">{formatNestedText(result[0].output.Fournisseur)}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium">Date:</h3>
                <p className="mt-1 text-gray-700">{result[0].output.date}</p>
              </div>

              <div>
                <h3 className="font-medium">Société:</h3>
                <p className="mt-1 text-gray-700">{result[0].output["name of the company"]}</p>
              </div>

              <div>
                <h3 className="font-medium">Adresse:</h3>
                <p className="mt-1 text-gray-700">{result[0].output.adresse}</p>
              </div>

              <div>
                <h3 className="font-medium">Numéro de facture:</h3>
                <p className="mt-1 text-gray-700">{result[0].output["Numéro de facture"]}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-medium">Montant HT:</h3>
                <p className="mt-1 text-gray-700">{result[0].output["Montant HT"]}</p>
              </div>

              <div>
                <h3 className="font-medium">Montant TVA:</h3>
                <p className="mt-1 text-gray-700">{result[0].output["Montant TVA"]}</p>
              </div>

              <div>
                <h3 className="font-medium">Montant TTC:</h3>
                <p className="mt-1 text-gray-700">{result[0].output["Montant TTC"]}</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium">Détail de facture:</h3>
              <div className="mt-1 text-gray-700">{formatNestedText(result[0].output[" Détail de facture"])}</div>
            </div>
          </div>
        </div>
      ) : (
        <p>Aucun texte extrait</p>
      )}
    </div>
  )
}
