"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, FileText, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface BankStatementUploaderProps {
  onProcessingStart: () => void
  onUploadComplete: (result: any) => void
  isProcessing: boolean
  error: string | null
}

export function BankStatementUploader({
  onProcessingStart,
  onUploadComplete,
  isProcessing,
  error,
}: BankStatementUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    // Check file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if (!allowedTypes.includes(file.type)) {
      onUploadComplete({
        error: "Type de fichier non supporté. Veuillez télécharger un PDF ou une image (JPG, PNG)",
      })
      return
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      onUploadComplete({
        error: "La taille du fichier dépasse la limite de 10 Mo",
      })
      return
    }

    setSelectedFile(file)
  }

  const uploadFile = async () => {
    if (!selectedFile) return

    onProcessingStart()

    const formData = new FormData()
    formData.append("file", selectedFile)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 5
          if (newProgress >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return newProgress
        })
      }, 200)

      // Send to webhook
      const response = await fetch("https://ocr-sys-u41198.vm.elestio.app/webhook/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      onUploadComplete(data)
    } catch (error) {
      console.error("Upload error:", error)
      onUploadComplete({
        error: "Une erreur s'est produite lors du traitement du fichier. Veuillez réessayer.",
      })
    } finally {
      setUploadProgress(0)
      setSelectedFile(null)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center ${
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isProcessing ? (
          <div className="w-full space-y-4">
            <div className="flex flex-col items-center justify-center space-y-2">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium">Traitement en cours...</p>
            </div>
            <Progress value={uploadProgress} className="h-2 w-full" />
          </div>
        ) : selectedFile ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center space-y-2">
              <FileText className="h-10 w-10 text-primary" />
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={uploadFile} className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Traiter le document
              </Button>
              <Button variant="outline" onClick={() => setSelectedFile(null)}>
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <p className="font-medium">Glissez-déposez votre fichier ici</p>
              <p className="text-sm text-muted-foreground">PDF, JPG ou PNG (max. 10MB)</p>
            </div>
            <Button onClick={triggerFileInput}>Sélectionner un fichier</Button>
          </div>
        )}
      </div>

      <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} />
    </div>
  )
}
