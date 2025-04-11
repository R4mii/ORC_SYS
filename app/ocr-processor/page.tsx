import { OcrInvoiceProcessor } from "@/components/ocr-invoice-processor"

export default function OcrProcessorPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Invoice OCR Processing</h1>
      <OcrInvoiceProcessor />
    </div>
  )
}
