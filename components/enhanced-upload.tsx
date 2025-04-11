"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, File, X, CheckCircle, AlertCircle, Trash2, RotateCw, ZoomIn, ZoomOut } from "lucide-react"

interface EnhancedUploadProps {
  onFilesAccepted: (files: File[]) => void
  maxFiles?: number
  maxSize?: number // in bytes
  acceptedFileTypes?: string[]
  showPreview?: boolean
}

export function EnhancedUpload({
  onFilesAccepted,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB default
  acceptedFileTypes = [".pdf", ".jpg", ".jpeg", ".png"],
  showPreview = true,
}: EnhancedUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [zoom, setZoom] = useState(1)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files))
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files))
    }
  }

  const addFiles = (newFiles: File[]) => {
    // Validate file count
    if (files.length + newFiles.length > maxFiles) {
      setErrors([...errors, `You can only upload a maximum of ${maxFiles} files.`])
      return
    }

    const validFiles: File[] = []
    const newErrors: string[] = []
    const newPreviews: string[] = []
    const newProgress: number[] = []

    // Validate each file
    newFiles.forEach((file) => {
      // Check file size
      if (file.size > maxSize) {
        newErrors.push(`File "${file.name}" exceeds the maximum size of ${maxSize / 1024 / 1024}MB.`)
        return
      }

      // Check file type
      const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`
      if (!acceptedFileTypes.includes(fileExtension) && !acceptedFileTypes.includes(file.type)) {
        newErrors.push(`File "${file.name}" has an unsupported format.`)
        return
      }

      // Create preview URL
      if (showPreview) {
        if (file.type.startsWith("image/")) {
          const previewUrl = URL.createObjectURL(file)
          newPreviews.push(previewUrl)
        } else {
          // For PDFs or other files, use a generic icon
          newPreviews.push("")
        }
      }

      validFiles.push(file)
      newProgress.push(0)
    })

    if (validFiles.length > 0) {
      setFiles([...files, ...validFiles])
      setPreviews([...previews, ...newPreviews])
      setUploadProgress([...uploadProgress, ...newProgress])

      // Simulate upload progress for demonstration
      simulateUploadProgress(files.length, validFiles.length)
    }

    if (newErrors.length > 0) {
      setErrors([...errors, ...newErrors])
    }
  }

  const simulateUploadProgress = (startIndex: number, count: number) => {
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const updated = [...prev]
        let allComplete = true

        for (let i = startIndex; i < startIndex + count; i++) {
          if (updated[i] < 100) {
            updated[i] += 5
            allComplete = false
          }
        }

        if (allComplete) {
          clearInterval(interval)
          // When all files are uploaded, notify parent
          onFilesAccepted(files)
        }

        return updated
      })
    }, 100)
  }

  const removeFile = (index: number) => {
    const newFiles = [...files]
    const newPreviews = [...previews]
    const newProgress = [...uploadProgress]

    // Release object URL to prevent memory leaks
    if (newPreviews[index]) {
      URL.revokeObjectURL(newPreviews[index])
    }

    newFiles.splice(index, 1)
    newPreviews.splice(index, 1)
    newProgress.splice(index, 1)

    setFiles(newFiles)
    setPreviews(newPreviews)
    setUploadProgress(newProgress)
  }

  const dismissError = (index: number) => {
    const newErrors = [...errors]
    newErrors.splice(index, 1)
    setErrors(newErrors)
  }

  return (
    <div className="space-y-4">
      {/* Drag & drop area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        } cursor-pointer hover:bg-muted/50`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={handleFileChange}
          accept={acceptedFileTypes.join(",")}
        />
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">Drag and drop files here</p>
          <p className="text-sm text-muted-foreground mb-4">or click to browse your files</p>
          <div className="text-xs text-muted-foreground">
            <p>Accepted file types: {acceptedFileTypes.join(", ")}</p>
            <p>Maximum file size: {maxSize / 1024 / 1024}MB</p>
            <p>Maximum files: {maxFiles}</p>
          </div>
        </div>
      </div>

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <Alert key={index} variant="destructive" className="flex justify-between items-center">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>{error}</AlertDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => dismissError(index)} className="h-6 w-6">
                <X className="h-4 w-4" />
              </Button>
            </Alert>
          ))}
        </div>
      )}

      {/* File previews */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Selected Files ({files.length})</h3>
            {showPreview && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                  className="h-8 w-8"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm">{Math.round(zoom * 100)}%</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                  className="h-8 w-8"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file, index) => (
              <div key={index} className="border rounded-lg overflow-hidden bg-card">
                <div className="p-3 border-b flex justify-between items-center">
                  <div className="flex items-center gap-2 truncate">
                    <File className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{file.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {showPreview && (
                  <div className="relative h-40 bg-muted/20 flex items-center justify-center">
                    {previews[index] ? (
                      <img
                        src={previews[index] || "/placeholder.svg"}
                        alt={file.name}
                        className="max-h-full max-w-full object-contain transition-transform"
                        style={{ transform: `scale(${zoom})` }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <File className="h-10 w-10 mb-2" />
                        <span className="text-xs">{file.type}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{(file.size / 1024).toFixed(1)} KB</span>
                    <span>{uploadProgress[index]}%</span>
                  </div>
                  <Progress value={uploadProgress[index]} className="h-1" />

                  {uploadProgress[index] === 100 && (
                    <div className="flex items-center justify-center mt-2 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      <span>Upload complete</span>
                    </div>
                  )}

                  {uploadProgress[index] < 100 && (
                    <div className="flex items-center justify-center mt-2 text-xs text-muted-foreground">
                      <RotateCw className="h-3 w-3 mr-1 animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
