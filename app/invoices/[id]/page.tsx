"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { FileIcon, MinusIcon, PlusIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function InvoiceDetailPage() {
  const router = useRouter()
  const [invoiceData, setInvoiceData] = useState({
    supplier: "HITECH LAND - 1104968",
    accountCharge: '61110000 Achats de marchandises "groupe A"',
    currency: "MAD",
    invoiceNumber: "FA21 20210460",
    invoiceDate: "13/02/2021",
    amountHT: "5 605,00 DH",
    amountTVA: "1 121,00 DH",
    stampDuty: "0,00 DH",
    expenses: "0,00 DH",
    amountTTC: "6 726,00 DH",
  })
  const [fileUrl, setFileUrl] = useState("")
  const [fileName, setFileName] = useState("")

  const handleValidate = () => {
    alert("Invoice validated!")
    router.push("/invoices")
  }

  // Add a state for showing/hiding the accounting entries
  const [showEntries, setShowEntries] = useState(false)

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-sm">
        {/* Warning message */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
          <p className="text-amber-700">La date de cette facture ne correspond pas à l'exercice fiscal courant</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Fournisseur</label>
            <input
              type="text"
              value={invoiceData.supplier || "HITECH LAND - 1104968"}
              className="w-full p-2 border border-gray-300 rounded-md"
              readOnly
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Compte de charge</label>
            <input
              type="text"
              value={invoiceData.accountCharge || '61110000 Achats de marchandises "groupe A"'}
              className="w-full p-2 border border-gray-300 rounded-md"
              readOnly
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Devise</label>
            <input
              type="text"
              value={invoiceData.currency || "MAD"}
              className="w-full p-2 border border-gray-300 rounded-md"
              readOnly
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Numéro de facture</label>
            <input
              type="text"
              value={invoiceData.invoiceNumber || "FA21 20210460"}
              className="w-full p-2 border border-gray-300 rounded-md"
              readOnly
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Date de facturation</label>
            <input
              type="text"
              value={invoiceData.invoiceDate || "13/02/2021"}
              className="w-full p-2 border border-gray-300 rounded-md"
              readOnly
            />
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="retenue" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
            <label htmlFor="retenue" className="text-sm font-medium text-gray-700">
              Retenue à la source
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="prorata" className="h-4 w-4 text-blue-600 border-gray-300 rounded" checked />
            <label htmlFor="prorata" className="text-sm font-medium text-gray-700">
              Prorata de TVA
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Montant HT</label>
            <input
              type="text"
              value={invoiceData.amountHT || "5 605,00 DH"}
              className="w-full p-2 border border-gray-300 rounded-md"
              readOnly
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Montant TVA</label>
            <input
              type="text"
              value={invoiceData.amountTVA || "1 121,00 DH"}
              className="w-full p-2 border border-gray-300 rounded-md"
              readOnly
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Droits de timbre</label>
            <input
              type="text"
              value={invoiceData.stampDuty || "0,00 DH"}
              className="w-full p-2 border border-gray-300 rounded-md"
              readOnly
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Débours</label>
            <input
              type="text"
              value={invoiceData.expenses || "0,00 DH"}
              className="w-full p-2 border border-gray-300 rounded-md"
              readOnly
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Montant TTC</label>
            <input
              type="text"
              value={invoiceData.amountTTC || "6 726,00 DH"}
              className="w-full p-2 border border-gray-300 rounded-md"
              readOnly
            />
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="nonRecuperable" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
            <label htmlFor="nonRecuperable" className="text-sm font-medium text-gray-700">
              TVA non Récupérable
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="multipleTVA" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
            <label htmlFor="multipleTVA" className="text-sm font-medium text-gray-700">
              Plusieurs montants de TVA
            </label>
          </div>

          {/* Add the Écriture button */}
          <div className="pt-2">
            <Button variant="outline" className="w-32 mx-auto" onClick={() => setShowEntries(!showEntries)}>
              Écritures
            </Button>
          </div>

          {/* Accounting entries section */}
          {showEntries && (
            <div className="mt-6 border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Compte
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Libellé
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Débit
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Crédit
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Taxes
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code de taxe
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 text-sm text-gray-900">61110000 Achats de...</td>
                    <td className="px-4 py-2 text-sm text-gray-900">HITECH LAND - N FA21 20210460</td>
                    <td className="px-4 py-2 text-sm text-gray-900">5 829,20 DH</td>
                    <td className="px-4 py-2 text-sm text-gray-900">0,00 DH</td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        TVA 20% ACHATS
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">140 - Prestations de...</td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      <Button variant="outline" size="sm">
                        Ajuster
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm text-gray-900">34552200 Etat - TV...</td>
                    <td className="px-4 py-2 text-sm text-gray-900">HITECH LAND - N FA21 20210460</td>
                    <td className="px-4 py-2 text-sm text-gray-900">896,80 DH</td>
                    <td className="px-4 py-2 text-sm text-gray-900">0,00 DH</td>
                    <td className="px-4 py-2 text-sm text-gray-900"></td>
                    <td className="px-4 py-2 text-sm text-gray-900"></td>
                    <td className="px-4 py-2 text-sm text-gray-900"></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm text-gray-900">44110000 Fournisse...</td>
                    <td className="px-4 py-2 text-sm text-gray-900">HITECH LAND - N FA21 20210460</td>
                    <td className="px-4 py-2 text-sm text-gray-900">0,00 DH</td>
                    <td className="px-4 py-2 text-sm text-gray-900">6 726,00 DH</td>
                    <td className="px-4 py-2 text-sm text-gray-900"></td>
                    <td className="px-4 py-2 text-sm text-gray-900"></td>
                    <td className="px-4 py-2 text-sm text-gray-900"></td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2} className="px-4 py-2 text-sm text-gray-900"></td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">6 726,00</td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">6 726,00</td>
                    <td colSpan={3} className="px-4 py-2 text-sm text-gray-900"></td>
                  </tr>
                </tfoot>
              </table>
              <div className="p-4">
                <Button variant="outline" size="sm" className="text-blue-600">
                  Ajouter une ligne
                </Button>
              </div>
            </div>
          )}

          <div className="pt-6 flex justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button onClick={handleValidate}>Valider</Button>
          </div>
        </div>
      </div>

      {/* Document preview panel */}
      <div className="w-full md:w-1/2 bg-white rounded-lg shadow-sm overflow-hidden">
        {fileUrl ? (
          <div className="h-full flex flex-col">
            <div className="bg-gray-100 p-2 flex items-center justify-between border-b">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <FileIcon className="h-4 w-4 mr-1" />
                </Button>
                <span className="text-sm">{fileName || "Document"}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm">
                  <MinusIcon className="h-4 w-4" />
                </Button>
                <span className="text-xs">1 of 1</span>
                <Button variant="ghost" size="sm">
                  <PlusIcon className="h-4 w-4" />
                </Button>
                <Select defaultValue="auto">
                  <SelectTrigger className="h-8 w-36">
                    <SelectValue placeholder="Zoom" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automatic Zoom</SelectItem>
                    <SelectItem value="100">100%</SelectItem>
                    <SelectItem value="150">150%</SelectItem>
                    <SelectItem value="200">200%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-50">
              {fileUrl.endsWith(".pdf") ? (
                <iframe src={fileUrl} className="w-full h-full" />
              ) : (
                <img
                  src={fileUrl || "/placeholder.svg"}
                  alt="Invoice document"
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center">
            <p className="text-gray-500">Aucun document disponible</p>
          </div>
        )}
      </div>
    </div>
  )
}

