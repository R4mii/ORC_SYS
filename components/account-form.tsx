"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DialogFooter } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"

interface AccountFormProps {
  onSubmit: (account: any) => void
  onCancel: () => void
  initialData?: any
}

export function AccountForm({ onSubmit, onCancel, initialData }: AccountFormProps) {
  const [number, setNumber] = useState(initialData?.number || "")
  const [name, setName] = useState(initialData?.name || "")
  const [type, setType] = useState<string>(initialData?.type || "asset")
  const [description, setDescription] = useState(initialData?.description || "")
  const [isActive, setIsActive] = useState(initialData?.isActive !== false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!number) newErrors.number = "Le numéro de compte est requis"
    if (!name) newErrors.name = "Le nom du compte est requis"
    if (!type) newErrors.type = "Le type de compte est requis"

    // Check if account number follows the pattern (numbers only)
    if (number && !/^\d+$/.test(number)) {
      newErrors.number = "Le numéro de compte doit contenir uniquement des chiffres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    const account = {
      id: initialData?.id || Math.random().toString(36).substring(2, 9),
      number,
      name,
      type,
      description,
      isActive,
      balance: initialData?.balance || 0,
    }

    onSubmit(account)
  }

  return (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="number">Numéro de compte</Label>
        <Input
          id="number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          className={errors.number ? "border-red-500" : ""}
        />
        {errors.number && <p className="text-xs text-red-500">{errors.number}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nom du compte</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type de compte</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger id="type" className={errors.type ? "border-red-500" : ""}>
            <SelectValue placeholder="Sélectionner un type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asset">Actif</SelectItem>
            <SelectItem value="liability">Passif</SelectItem>
            <SelectItem value="equity">Capitaux propres</SelectItem>
            <SelectItem value="revenue">Produit</SelectItem>
            <SelectItem value="expense">Charge</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
        <Label htmlFor="isActive">Compte actif</Label>
      </div>

      <DialogFooter className="pt-4">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button onClick={handleSubmit}>{initialData ? "Mettre à jour" : "Créer"}</Button>
      </DialogFooter>
    </div>
  )
}
