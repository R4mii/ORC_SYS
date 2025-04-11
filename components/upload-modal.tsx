"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { EnhancedUpload } from "@/components/enhanced-upload"

interface UploadModalProps {
  title: string
  isOpen: boolean
  onClose: () => void
  onAccept: (files: File[]) => void
}

export function UploadModal({ title, isOpen, onClose, onAccept }: UploadModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Charger des {title}</DialogTitle>
          <DialogDescription>Sélectionnez les fichiers à charger.</DialogDescription>
        </DialogHeader>
        <EnhancedUpload onFilesAccepted={onAccept} />
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
