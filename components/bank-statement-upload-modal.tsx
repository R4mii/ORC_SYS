"use client"
import { Dialog } from "@/components/ui/dialog"

// JSON field definitions schema
const fieldDefinitions = [
  { name: "Agence", description: "Nom de l’agence bancaire" },
  { name: "Adresse", description: "Adresse postale complète de l’agence" },
  { name: "Téléphone", description: "Numéro de téléphone de l’agence" },
  {
    name: "Numéro de compte principal",
    description: "Numéro de compte principal (11 chiffres) tel qu’indiqué sur le RIB",
  },
  { name: "Code banque", description: "Code banque à 5 chiffres" },
  { name: "Code guichet", description: "Code guichet à 5 chiffres" },
  { name: "Clé RIB", description: "Clé de contrôle RIB (2 chiffres)" },
  { name: "Localité", description: "Ville ou localité de l’agence" },
  { name: "Ancien solde au", description: "Date et montant de l’ancien solde" },
  { name: "Date opération", description: "Date à laquelle l’opération a été effectuée" },
  { name: "Date valeur", description: "Date de valeur associée à l’opération" },
  { name: "Référence", description: "Numéro de référence de l’opération" },
  { name: "Nature opération", description: "Libellé ou description de l’opération" },
  { name: "Montant débit", description: "Montant porté au débit du compte" },
  { name: "Montant crédit", description: "Montant porté au crédit du compte" },
  { name: "Solde à reporter", description: "Solde à reporter en fin de page" },
  { name: "Nouveau solde au", description: "Date et montant du nouveau solde" },
]

interface BankStatementUploadModalProps {
  open: boolean
  onClose: () => void
  onUploadComplete: (data: any) => void
}

export function BankStatementUploadModal({ open, onClose, onUploadComplete }: BankStatementUploadModalProps) {
  // ... existing state and refs ...

  const handleConfirm = () => {
    if (ocrResults) {
      const result = {
        ...ocrResults,
        originalFile: {
          name: files[0].name,
          type: files[0].type,
          size: files[0].size,
        },
        fields: fieldDefinitions,
        options: {},
      }

      onUploadComplete(result)
      onClose()
    }
  }

  // ... rest of component unchanged ...
  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* ... dialog content ... */}
    </Dialog>
  )
}
