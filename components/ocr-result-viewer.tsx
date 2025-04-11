"use client"

import { CardFooter } from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from "react"

interface OcrResultViewerProps {
  data: any
  isProcessing?: boolean
  processingProgress?: number
  onSave?: (data: any) => void
}

export default function OcrResultViewer({ data, isProcessing, processingProgress, onSave }: OcrResultViewerProps) {
  const [activeTab, setActiveTab] = useState("details")
  const [editMode, setEditMode] = useState(false)
  const [editedData, setEditedData] = useState<any>(null)

  useEffect(() => {
    if (data && data[0]?.invoice) {
      setEditedData({ ...data[0].invoice })
      console.log("Data received in OcrResultViewer:", data[0])
    }
  }, [data])

  const handleFieldChange = (field: string, value: any) => {
    if (!editedData) return
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = () => {
    if (onSave && editedData) {
      onSave(editedData)
    }
    setEditMode(false)
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="raw">Raw Text</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
              <CardDescription>Extracted invoice information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Invoice Number</Label>
                  <Input
                    value={editedData?.invoiceNumber || ""}
                    onChange={(e) => handleFieldChange("invoiceNumber", e.target.value)}
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <Label>Invoice Date</Label>
                  <Input
                    value={editedData?.invoiceDate || ""}
                    onChange={(e) => handleFieldChange("invoiceDate", e.target.value)}
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <Label>Supplier</Label>
                  <Input
                    value={editedData?.supplier || ""}
                    onChange={(e) => handleFieldChange("supplier", e.target.value)}
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input
                    value={editedData?.amount || ""}
                    onChange={(e) => handleFieldChange("amount", e.target.value)}
                    disabled={!editMode}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {editMode ? (
                <>
                  <Button variant="outline" onClick={() => setEditMode(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save</Button>
                </>
              ) : (
                <Button onClick={() => setEditMode(true)}>Edit</Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="raw">
          <Card>
            <CardHeader>
              <CardTitle>Raw Text</CardTitle>
              <CardDescription>Extracted text from the document</CardDescription>
            </CardHeader>
            <CardContent>
              {data && data[0]?.rawText ? (
                <pre className="whitespace-pre-wrap">{data[0].rawText}</pre>
              ) : (
                <div>No raw text available.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
