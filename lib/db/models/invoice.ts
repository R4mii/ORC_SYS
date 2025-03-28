import mongoose, { type Document, Schema } from "mongoose"

// Invoice item schema
const InvoiceItemSchema = new Schema({
  description: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
})

// Invoice schema
const InvoiceSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  invoiceNumber: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  dueDate: {
    type: Date,
  },
  supplier: {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    taxId: {
      type: String,
    },
  },
  customer: {
    name: {
      type: String,
    },
    address: {
      type: String,
    },
  },
  items: [InvoiceItemSchema],
  subtotal: {
    type: Number,
    required: true,
  },
  taxAmount: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "USD",
  },
  status: {
    type: String,
    enum: ["draft", "pending", "paid", "overdue", "cancelled"],
    default: "draft",
  },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "partial", "paid"],
    default: "unpaid",
  },
  declarationStatus: {
    type: String,
    enum: ["undeclared", "declared"],
    default: "undeclared",
  },
  notes: {
    type: String,
  },
  ocrConfidence: {
    type: Number,
    default: 0,
  },
  originalFile: {
    filename: String,
    path: String,
    mimeType: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Update the updatedAt field on save
InvoiceSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  next()
})

// Create and export the model
export interface InvoiceDocument extends Document {
  userId: mongoose.Types.ObjectId
  companyId: mongoose.Types.ObjectId
  invoiceNumber: string
  date: Date
  dueDate?: Date
  supplier: {
    name: string
    address?: string
    taxId?: string
  }
  customer: {
    name?: string
    address?: string
  }
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    amount: number
  }>
  subtotal: number
  taxAmount: number
  total: number
  currency: string
  status: "draft" | "pending" | "paid" | "overdue" | "cancelled"
  paymentStatus: "unpaid" | "partial" | "paid"
  declarationStatus: "undeclared" | "declared"
  notes?: string
  ocrConfidence: number
  originalFile?: {
    filename: string
    path: string
    mimeType: string
  }
  createdAt: Date
  updatedAt: Date
}

// Only create the model if it doesn't already exist
export const Invoice = mongoose.models.Invoice || mongoose.model<InvoiceDocument>("Invoice", InvoiceSchema)

