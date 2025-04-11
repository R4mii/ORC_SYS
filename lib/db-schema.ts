// This file defines the database schema for the accounting system
// In a real application, you would use Prisma, Drizzle, or another ORM

export interface User {
  id: string
  name: string
  email: string
  password: string // In a real app, this would be a hashed password
  role: "admin" | "accountant" | "viewer"
  createdAt: Date
  updatedAt: Date
}

export interface Invoice {
  id: string
  userId: string // Foreign key to User
  invoiceNumber: string
  date: Date
  supplier: string
  amount: number
  vat: number
  status: "draft" | "pending" | "paid" | "overdue"
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  invoiceId: string // Foreign key to Invoice
  categoryId: string // Foreign key to Category
  amount: number
  transactionDate: Date
  description: string
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  type: "expense" | "revenue" | "tax"
  description: string
  createdAt: Date
  updatedAt: Date
}

export interface AuditLog {
  id: string
  userId: string // Foreign key to User
  action: string
  details: string
  timestamp: Date
}

// Example of how to use these interfaces:
/*
// Create a new user
const newUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'hashedPassword123',
  role: 'accountant'
};

// Create a new invoice
const newInvoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> = {
  userId: 'user-123',
  invoiceNumber: 'INV-001',
  date: new Date(),
  supplier: 'Office Supplies Co.',
  amount: 1250.00,
  vat: 250.00,
  status: 'pending'
};
*/
