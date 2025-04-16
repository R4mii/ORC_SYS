"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Upload, FileText, AlertCircle } from "lucide-react"

export default function BankStatementUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Veuillez sélectionner un fichier")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/bank-statements", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Une erreur s'est produite lors du traitement du relevé bancaire")
      }

      setUploadResult(data)
      setIsDialogOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur s'est produite")
    } finally {
      setIsUploading(false)
    }
  }

  const handleConfirm = () => {
    // Here you would save the data to your database
    setIsDialogOpen(false)
    setFile(null)
    setUploadResult(null)
    // You could add a success message here
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Charger un relevé bancaire</CardTitle>
          <CardDescription>
            Téléchargez votre relevé bancaire pour extraire automatiquement les informations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="flex flex-col items-center justify-center space-y-2">
                <Upload className="h-8 w-8 text-gray-400" />
                <div className="text-sm text-gray-500">
                  <Label htmlFor="file-upload" className="cursor-pointer text-primary hover:underline">
                    Cliquez pour sélectionner
                  </Label>{" "}
                  ou glissez-déposez votre fichier ici
                </div>
                <Input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
              </div>
              {file && (
                <div className="mt-4 flex items-center justify-center text-sm">
                  <FileText className="h-4 w-4 mr-2 text-primary" />
                  <span>{file.name}</span>
                </div>
              )}
            </div>
            {error && (
              <div className="text-red-500 text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {error}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleUpload} disabled={!file || isUploading} className="w-full">
            {isUploading ? "Traitement en cours..." : "Charger le relevé"}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Informations extraites</DialogTitle>
            <DialogDescription>Veuillez vérifier les informations extraites du relevé bancaire</DialogDescription>
          </DialogHeader>
          {uploadResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nom du titulaire du compte</Label>
                  <div className="p-2 border rounded mt-1">{uploadResult.fields.accountHolder}</div>
                </div>
                <div>
                  <Label>Banque</Label>
                  <div className="p-2 border rounded mt-1">{uploadResult.fields.bank}</div>
                </div>
              </div>
              <div>
                <Label>Numéro de compte</Label>
                <div className="p-2 border rounded mt-1">{uploadResult.fields.accountNumber}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Date de relevé</Label>
                  <div className="p-2 border rounded mt-1">{uploadResult.fields.statementDate}</div>
                </div>
                <div>
                  <Label>Ancien solde</Label>
                  <div className="p-2 border rounded mt-1">{uploadResult.fields.previousBalance}</div>
                </div>
                <div>
                  <Label>Nouveau solde</Label>
                  <div className="p-2 border rounded mt-1">{uploadResult.fields.newBalance}</div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleConfirm}>Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
