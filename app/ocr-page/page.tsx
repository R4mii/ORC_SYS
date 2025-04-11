import OcrUploadForm from "@/components/ocr-upload-form"

export default function OcrPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">OCR Document Processing</h1>
      <OcrUploadForm />
    </div>
  )
}
