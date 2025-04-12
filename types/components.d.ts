export interface ModernFileUploadModalProps {
  open: boolean
  onClose: () => void
  documentType: string
  onUploadComplete: (result: any) => void // Replace 'any' with your result type
} 