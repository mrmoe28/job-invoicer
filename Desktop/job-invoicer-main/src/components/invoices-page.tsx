'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Plus, 
  Search, 
  Download, 
  Send, 
  Eye,
  DollarSign,
  Calendar,
  User,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import type { Invoice, Customer, Job } from '@/lib/types'

interface InvoiceWithDetails extends Invoice {
  customer: Customer;
  job: Job;
}

export function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Mock data - replace with API calls
  const [invoices] = useState<InvoiceWithDetails[]>([
    {
      id: '1',
      jobId: '1',
      customerId: '1',
      invoiceNumber: 'INV-2024-001',
      status: 'paid',
      amount: 12500,
      dueDate: new Date('2024-02-28'),
      paidDate: new Date('2024-02-25'),
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-25'),
      customer: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      job: {
        id: '1',
        customerId: '1',
        title: 'Kitchen Renovation',
        status: 'completed',
        amount: 12500,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    {
      id: '2',
      jobId: '2',
      customerId: '2',
      invoiceNumber: 'INV-2024-002',
      status: 'sent',
      amount: 8000,
      dueDate: new Date('2024-03-15'),
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-02-15'),
      customer: {
        id: '2',
        name: 'Sarah Smith',
        email: 'sarah@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      job: {
        id: '2',
        customerId: '2',
        title: 'Bathroom Remodel',
        status: 'in-progress',
        amount: 8000,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    {
      id: '3',
      jobId: '3',
      customerId: '3',
      invoiceNumber: 'INV-2024-003',
      status: 'overdue',
      amount: 6500,
      dueDate: new Date('2024-01-15'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      customer: {
        id: '3',
        name: 'Acme Corp',
        email: 'contact@acme.com',
        company: 'Acme Corp',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      job: {
        id: '3',
        customerId: '3',
        title: 'Deck Installation',
        status: 'completed',
        amount: 6500,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    {
      id: '4',
      jobId: '4',
      customerId: '1',
      invoiceNumber: 'INV-2024-004',
      status: 'draft',
      amount: 3200,
      dueDate: new Date('2024-04-01'),
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-01'),
      customer: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      job: {
        id: '4',
        customerId: '1',
        title: 'Garage Door Replacement',
        status: 'pending',
        amount: 3200,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  ])

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.job.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: Invoice['status']) => {
    const variants = {
      'draft': { label: 'Draft', className: 'bg-gray-100 text-gray-800', icon: FileText },
      'sent': { label: 'Sent', className: 'bg-blue-100 text-blue-800', icon: Send },
      'paid': { label: 'Paid', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      'overdue': { label: 'Overdue', className: 'bg-red-100 text-red-800', icon: AlertCircle }
    }
    const variant = variants[status]
    const Icon = variant.icon
    return (
      <Badge className={`${variant.className} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {variant.label}
      </Badge>
    )
  }

  const stats = {
    total: invoices.length,
    draft: invoices.filter(i => i.status === 'draft').length,
    sent: invoices.filter(i => i.status === 'sent').length,
    paid: invoices.filter(i => i.status === 'paid').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.amount, 0),
    paidAmount: invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0),
    pendingAmount: invoices.filter(i => i.status !== 'paid').reduce((sum, inv) => sum + inv.amount, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">Manage billing and track payments</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.draft} draft, {stats.sent} sent
                </p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">${stats.totalAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">All invoices</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold">${stats.paidAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{stats.paid} invoices</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold">${stats.pendingAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-red-600">{stats.overdue} overdue</span>
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by invoice number, customer, or job..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('all')}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filterStatus === 'draft' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('draft')}
            size="sm"
          >
            Draft
          </Button>
          <Button
            variant={filterStatus === 'sent' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('sent')}
            size="sm"
          >
            Sent
          </Button>
          <Button
            variant={filterStatus === 'paid' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('paid')}
            size="sm"
          >
            Paid
          </Button>
          <Button
            variant={filterStatus === 'overdue' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('overdue')}
            size="sm"
          >
            Overdue
          </Button>
        </div>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    {invoice.invoiceNumber}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p>{invoice.customer.name}</p>
                        <p className="text-sm text-muted-foreground">{invoice.customer.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{invoice.job.title}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className={invoice.status === 'overdue' ? 'text-red-600 font-medium' : ''}>
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">${invoice.amount.toLocaleString()}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" title="View Invoice">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {invoice.status === 'draft' && (
                        <Button variant="ghost" size="icon" title="Send Invoice">
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" title="Download PDF">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No invoices found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Invoice Dialog */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>
              Select a job and customer to create a new invoice.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <p className="text-sm text-muted-foreground">
                This feature is coming soon! You'll be able to:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                <li>Select a customer and job</li>
                <li>Set invoice amount and due date</li>
                <li>Add line items and descriptions</li>
                <li>Send invoices directly to customers</li>
              </ul>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}