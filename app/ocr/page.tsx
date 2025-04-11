import OcrUploader from "@/components/OcrUploader"

export default function OcrPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Invoice OCR Processing</h1>
      <OcrUploader />
    </div>
  )
}
