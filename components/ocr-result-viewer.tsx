"use client"

interface OcrResultViewerProps {
  data: any
  isProcessing?: boolean
  processingProgress?: number
  onSave?: (data: any) => void
}

export function OcrResultViewer({ data, isProcessing, processingProgress, onSave }: OcrResultViewerProps) {
  return (
    <div>
      {/* Placeholder for OCR Result Viewer content */}
      <p>OCR Result Viewer Component</p>
      {/* Display data, loading state, and processing progress as needed */}
    </div>
  )
}

export default OcrResultViewer
