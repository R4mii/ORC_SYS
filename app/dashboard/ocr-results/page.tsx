"use client"

import { useState, useEffect } from "react"
import { OcrResultViewer } from "@/components/ocr-result-viewer"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export default function OcrResultsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [ocrData, setOcrData] = useState<any>(null)

  useEffect(() => {
    // Simulate loading and processing
    setIsLoading(true)

    // Start progress simulation
    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval)
          return 95
        }
        return prev + 5
      })
    }, 100)

    // Simulate API response with the provided data
    setTimeout(() => {
      const data = [
        {
          output: {
            Fournisseur: "Mohammed Khalil Loubaris",
            date: "24 / 04 / 2020",
            "name of the company": "Studio Loiseau",
            adresse: "32, Route De L'Epéry - 75098 Paris",
            "Numéro de facture": "20053",
            "Montant HT": "1.085,00",
            "Montant TVA": "0,00",
            "Montant TTC": "1.085,00",
            " Détail de facture":
              "Bol - série NØDT \nBol diamètre 25 cm . Céramique, fait main en France. : 10 pièces x 14,50\nCarafe - série NØDT \nCarafe hauteur 35 cm . Céramique, faite main en France. : 20 pièces x 47,00",
          },
        },
      ]

      setOcrData(data)
      setProcessingProgress(100)
      setIsLoading(false)
      clearInterval(interval)

      toast({
        title: "Traitement OCR terminé",
        description: "Les données ont été extraites avec succès",
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [toast])

  const handleSave = (data: any) => {
    // Here you would typically save the data to your backend
    console.log("Saving data:", data)

    toast({
      title: "Facture enregistrée",
      description: "La facture a été enregistrée avec succès",
    })

    // Redirect to invoices page
    setTimeout(() => {
      router.push("/dashboard/invoices")
    }, 1000)
  }

  return (
    <div className="container mx-auto py-6">
      <OcrResultViewer
        data={ocrData}
        isProcessing={isLoading}
        processingProgress={processingProgress}
        onSave={handleSave}
      />
    </div>
  )
}
