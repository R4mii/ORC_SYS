"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Trash2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface JournalEntryFormProps {
  onSubmit: (entry: any) => void
  onCancel: () => void
  initialData?: any
}

interface EntryLine {
  id: string
  accountNumber: string
  accountName: string
  debit: number
  credit: number
}

export function JournalEntryForm({ onSubmit, onCancel, initialData }: JournalEntryFormProps) {
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split("T")[0])
  const [reference, setReference] = useState(
    initialData?.reference ||
      `JE-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`,
  )
  const [description, setDescription] = useState(initialData?.description || "")
  const [lines, setLines] = useState<EntryLine[]>(
    initialData?.entries || [
      { id: "1", accountNumber: "", accountName: "", debit: 0, credit: 0 },
      { id: "2", accountNumber: "", accountName: "", debit: 0, credit: 0 },
    ],
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [accounts, setAccounts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("form")

  useEffect(() => {
    // Load chart of accounts
    const companyId = localStorage.getItem("selectedCompanyId")
    if (companyId) {
      const accountsData = localStorage.getItem(`chart_of_accounts_${companyId}`)
      if (accountsData) {
        setAccounts(JSON.parse(accountsData))
      } else {
        // Sample accounts if none exist
        const sampleAccounts = [
          { number: "5141", name: "Banque", type: "asset" },
          { number: "5161", name: "Caisse", type: "asset" },
          { number: "4111", name: "Clients", type: "asset" },
          { number: "4011", name: "Fournisseurs", type: "liability" },
          { number: "6174", name: "Fournitures de bureau", type: "expense" },
          { number: "6132", name: "Loyer", type: "expense" },
          { number: "7111", name: "Ventes de produits", type: "revenue" },
          { number: "7121", name: "Ventes de services", type: "revenue" },
          { number: "4456", name: "TVA déductible", type: "asset" },
          { number: "4455", name: "TVA collectée", type: "liability" },
        ]
        localStorage.setItem(`chart_of_accounts_${companyId}`, JSON.stringify(sampleAccounts))
        setAccounts(sampleAccounts)
      }
    }
  }, [])

  const handleAddLine = () => {
    setLines([
      ...lines,
      {
        id: Date.now().toString(),
        accountNumber: "",
        accountName: "",
        debit: 0,
        credit: 0,
      },
    ])
  }

  const handleRemoveLine = (id: string) => {
    if (lines.length <= 2) {
      return // Keep at least 2 lines
    }
    setLines(lines.filter((line) => line.id !== id))
  }

  const handleLineChange = (id: string, field: keyof EntryLine, value: string | number) => {
    setLines(
      lines.map((line) => {
        if (line.id === id) {
          const updatedLine = { ...line, [field]: value }

          // If account number changed, update account name
          if (field === "accountNumber") {
            const account = accounts.find((a) => a.number === value)
            if (account) {
              updatedLine.accountName = account.name
            }
          }

          return updatedLine
        }
        return line
      }),
    )
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!date) newErrors.date = "La date est requise"
    if (!reference) newErrors.reference = "La référence est requise"
    if (!description) newErrors.description = "La description est requise"

    // Check if any line is missing account
    const hasEmptyAccount = lines.some((line) => !line.accountNumber)
    if (hasEmptyAccount) {
      newErrors.lines = "Tous les comptes doivent être renseignés"
    }

    // Check if debits and credits balance
    const totalDebit = lines.reduce((sum, line) => sum + (Number.parseFloat(line.debit.toString()) || 0), 0)
    const totalCredit = lines.reduce((sum, line) => sum + (Number.parseFloat(line.credit.toString()) || 0), 0)

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      newErrors.balance = "Les débits et crédits doivent être équilibrés"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      setActiveTab("form")
      return
    }

    const entry = {
      id: initialData?.id || Math.random().toString(36).substring(2, 9),
      date,
      reference,
      description,
      entries: lines.map((line) => ({
        accountNumber: line.accountNumber,
        accountName: line.accountName,
        debit: Number.parseFloat(line.debit.toString()) || 0,
        credit: Number.parseFloat(line.credit.toString()) || 0,
      })),
      status: "draft",
      createdBy: "Current User",
      createdAt: new Date().toISOString(),
      total: lines.reduce((sum, line) => sum + (Number.parseFloat(line.debit.toString()) || 0), 0),
    }

    onSubmit(entry)
  }

  // Calculate totals
  const totalDebit = lines.reduce((sum, line) => sum + (Number.parseFloat(line.debit.toString()) || 0), 0)
  const totalCredit = lines.reduce((sum, line) => sum + (Number.parseFloat(line.credit.toString()) || 0), 0)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="form">Formulaire</TabsTrigger>
        <TabsTrigger value="preview">Aperçu</TabsTrigger>
      </TabsList>

      <TabsContent value="form" className="space-y-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={errors.date ? "border-red-500" : ""}
            />
            {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Référence</Label>
            <Input
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className={errors.reference ? "border-red-500" : ""}
            />
            {errors.reference && <p className="text-xs text-red-500">{errors.reference}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={errors.description ? "border-red-500" : ""}
          />
          {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Lignes d'écriture</Label>
            <Button type="button" variant="outline" size="sm" onClick={handleAddLine}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Ajouter une ligne
            </Button>
          </div>

          {errors.lines && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{errors.lines}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
              <div className="col-span-5">Compte</div>
              <div className="col-span-3">Débit</div>
              <div className="col-span-3">Crédit</div>
              <div className="col-span-1"></div>
            </div>

            {lines.map((line, index) => (
              <div key={line.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <Select
                    value={line.accountNumber}
                    onValueChange={(value) => handleLineChange(line.id, "accountNumber", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un compte" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.number} value={account.number}>
                          {account.number} - {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-3">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.debit || ""}
                    onChange={(e) => {
                      handleLineChange(line.id, "debit", Number.parseFloat(e.target.value) || 0)
                      if (Number.parseFloat(e.target.value) > 0) {
                        handleLineChange(line.id, "credit", 0)
                      }
                    }}
                    className="text-right"
                  />
                </div>

                <div className="col-span-3">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.credit || ""}
                    onChange={(e) => {
                      handleLineChange(line.id, "credit", Number.parseFloat(e.target.value) || 0)
                      if (Number.parseFloat(e.target.value) > 0) {
                        handleLineChange(line.id, "debit", 0)
                      }
                    }}
                    className="text-right"
                  />
                </div>

                <div className="col-span-1 flex justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveLine(line.id)}
                    disabled={lines.length <= 2}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="grid grid-cols-12 gap-2 pt-2 border-t font-medium">
              <div className="col-span-5 text-right">Total</div>
              <div className="col-span-3 text-right">{totalDebit.toFixed(2)} DH</div>
              <div className="col-span-3 text-right">{totalCredit.toFixed(2)} DH</div>
              <div className="col-span-1"></div>
            </div>

            {!isBalanced && (
              <div className="grid grid-cols-12 gap-2 text-red-500">
                <div className="col-span-5 text-right">Différence</div>
                <div className="col-span-6 text-right">{Math.abs(totalDebit - totalCredit).toFixed(2)} DH</div>
                <div className="col-span-1"></div>
              </div>
            )}
          </div>
        </div>

        {errors.balance && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erreur de balance</AlertTitle>
            <AlertDescription>{errors.balance}</AlertDescription>
          </Alert>
        )}
      </TabsContent>

      <TabsContent value="preview" className="space-y-4">
        <div className="border rounded-lg p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium">{reference}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Date: {new Date(date).toLocaleDateString()}</p>
              <p className="text-xs text-muted-foreground">Statut: Brouillon</p>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left">Compte</th>
                  <th className="px-4 py-2 text-right">Débit</th>
                  <th className="px-4 py-2 text-right">Crédit</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.id} className="border-t">
                    <td className="px-4 py-2">
                      {line.accountNumber && (
                        <>
                          <span className="font-medium">{line.accountNumber}</span> - {line.accountName}
                        </>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {Number.parseFloat(line.debit.toString()) > 0
                        ? `${Number.parseFloat(line.debit.toString()).toFixed(2)} DH`
                        : ""}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {Number.parseFloat(line.credit.toString()) > 0
                        ? `${Number.parseFloat(line.credit.toString()).toFixed(2)} DH`
                        : ""}
                    </td>
                  </tr>
                ))}
                <tr className="border-t bg-muted/30 font-medium">
                  <td className="px-4 py-2">Total</td>
                  <td className="px-4 py-2 text-right">{totalDebit.toFixed(2)} DH</td>
                  <td className="px-4 py-2 text-right">{totalCredit.toFixed(2)} DH</td>
                </tr>
              </tbody>
            </table>
          </div>

          {!isBalanced && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Écriture non équilibrée</AlertTitle>
              <AlertDescription>
                La différence entre les débits et les crédits est de {Math.abs(totalDebit - totalCredit).toFixed(2)} DH.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </TabsContent>

      <DialogFooter className="pt-4">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} disabled={!isBalanced}>
          Enregistrer
        </Button>
      </DialogFooter>
    </Tabs>
  )
}
