"use client"

import type React from "react"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  MoreHorizontal,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Column<T> {
  key: string
  header: string
  cell: (item: T) => React.ReactNode
  sortable?: boolean
  className?: string
}

interface EnhancedDataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyField: keyof T
  searchable?: boolean
  searchPlaceholder?: string
  pagination?: boolean
  pageSize?: number
  actions?: {
    label: string
    onClick: (item: T) => void
    icon?: React.ReactNode
  }[]
  onRowClick?: (item: T) => void
}

export function EnhancedDataTable<T>({
  data,
  columns,
  keyField,
  searchable = true,
  searchPlaceholder = "Search...",
  pagination = true,
  pageSize = 10,
  actions,
  onRowClick,
}: EnhancedDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  // Filter data based on search term
  const filteredData = searchTerm
    ? data.filter((item) =>
        Object.values(item).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase())),
      )
    : data

  // Sort data if a sort column is selected
  const sortedData = sortColumn
    ? [...filteredData].sort((a, b) => {
        const aValue = a[sortColumn as keyof T]
        const bValue = b[sortColumn as keyof T]

        if (aValue === bValue) return 0

        const result = aValue < bValue ? -1 : 1
        return sortDirection === "asc" ? result : -result
      })
    : filteredData

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const paginatedData = pagination ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize) : sortedData

  // Handle sort
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(columnKey)
      setSortDirection("asc")
    }
  }

  // Handle row selection
  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRows(newSelected)
  }

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set())
    } else {
      const newSelected = new Set<string>()
      paginatedData.forEach((item) => {
        newSelected.add(String(item[keyField]))
      })
      setSelectedRows(newSelected)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      {searchable && (
        <div className="flex flex-col sm:flex-row gap-2 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              className="pl-8 h-9"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1) // Reset to first page on search
              }}
            />
          </div>
          <Button size="sm" variant="outline">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {actions && (
                <TableHead className="w-[30px]">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4"
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8 data-[state=open]:bg-accent"
                      onClick={() => handleSort(column.key)}
                    >
                      {column.header}
                      {sortColumn === column.key ? (
                        sortDirection === "asc" ? (
                          <ChevronDown className="ml-2 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-2 h-4 w-4 rotate-180" />
                        )
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
              {actions && <TableHead className="w-[50px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <TableRow
                  key={String(item[keyField])}
                  className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {actions && (
                    <TableCell
                      className="w-[30px]"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectRow(String(item[keyField]))
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedRows.has(String(item[keyField]))}
                        onChange={() => {}}
                        className="h-4 w-4"
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={`${String(item[keyField])}-${column.key}`}>{column.cell(item)}</TableCell>
                  ))}
                  {actions && (
                    <TableCell className="w-[50px]">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions.map((action, index) => (
                            <DropdownMenuItem
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation()
                                action.onClick(item)
                              }}
                            >
                              {action.icon}
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 2 : 0)} className="h-24 text-center">
                  <div className="text-muted-foreground">{searchTerm ? "No results found" : "No data available"}</div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
            {filteredData.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            <div className="text-sm">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

