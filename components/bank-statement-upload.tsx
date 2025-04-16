"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, Check, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface BankStatementData {
  accountHolderName: string
  bank: string
  accountNumber: string
  statementDate: string
  previousBalance: string
  newBalance: string
}

export function BankStatementUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [extractedData, setExtractedData] = useState<BankStatementData | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadStatus("loading")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("documentType", "bankStatements")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload file")
      }

      // Process the extracted data
      const bankStatementData: BankStatementData = {
        accountHolderName: data.accountHolderName || "Not detected",
        bank: data.bank || "Not detected",
        accountNumber: data.accountNumber || "Not detected",
        statementDate: data.statementDate || "Not detected",
        previousBalance: data.previousBalance || "Not detected",
        newBalance: data.newBalance || "Not detected",
      }

      setExtractedData(bankStatementData)
      setUploadStatus("success")
    } catch (error) {
      console.error("Error uploading file:", error)
      setUploadStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = () => {
    // Here you would save the extracted data to your database
    console.log("Saving bank statement data:", extractedData)
    setIsModalOpen(false)
    setFile(null)
    setUploadStatus("idle")
    setExtractedData(null)
  }

  const openModal = () => {
    setIsModalOpen(true)
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Relevés Bancaires</CardTitle>
          <CardDescription>Téléchargez vos relevés bancaires pour extraction automatique</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="bankStatement">Fichier</Label>
              <Input id="bankStatement" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Annuler</Button>
          <Button onClick={openModal} disabled={!file}>
            <Upload className="mr-2 h-4 w-4" /> Charger
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Traitement du relevé bancaire</DialogTitle>
            <DialogDescription>
              {uploadStatus === "idle" && "Cliquez sur Traiter pour extraire les données du relevé bancaire."}
              {uploadStatus === "loading" && "Extraction des données en cours..."}
              {uploadStatus === "success" && "Données extraites avec succès. Vérifiez les informations ci-dessous."}
              {uploadStatus === "error" && "Une erreur s'est produite lors de l'extraction des données."}
            </DialogDescription>
          </DialogHeader>

          {uploadStatus === "idle" && (
            <div className="flex items-center space-x-2">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="font-medium">{file?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {file?.size ? `${(file.size / 1024).toFixed(2)} KB` : ""}
                </p>
              </div>
            </div>
          )}

          {uploadStatus === "loading" && (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <p className="mt-2 text-sm text-muted-foreground">Traitement en cours...</p>
            </div>
          )}

          {uploadStatus === "success" && extractedData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nom du titulaire</Label>
                  <p className="text-sm font-medium">{extractedData.accountHolderName}</p>
                </div>
                <div>
                  <Label>Banque</Label>
                  <p className="text-sm font-medium">{extractedData.bank}</p>
                </div>
                <div>
                  <Label>Numéro de compte</Label>
                  <p className="text-sm font-medium">{extractedData.accountNumber}</p>
                </div>
                <div>
                  <Label>Date de relevé</Label>
                  <p className="text-sm font-medium">{extractedData.statementDate}</p>
                </div>
                <div>
                  <Label>Ancien solde</Label>
                  <p className="text-sm font-medium">{extractedData.previousBalance}</p>
                </div>
                <div>
                  <Label>Nouveau solde</Label>
                  <p className="text-sm font-medium">{extractedData.newBalance}</p>
                </div>
              </div>
            </div>
          )}

          {uploadStatus === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            {uploadStatus === "idle" && (
              <Button onClick={handleUpload} disabled={isUploading}>
                Traiter
              </Button>
            )}
            {uploadStatus === "success" && (
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Check className="mr-2 h-4 w-4" /> Confirmer
              </Button>
            )}
            {uploadStatus === "error" && (
              <Button
                onClick={() => {
                  setUploadStatus("idle")
                  setErrorMessage("")
                }}
              >
                Réessayer
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
