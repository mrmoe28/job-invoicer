'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDate, createStripeCheckoutSession } from '@/lib/invoice-utils';
import {
  CreditCard,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  DollarSign,
  Trash2,
  Plus
} from 'lucide-react';

interface Payment {
  id: string;
  invoiceId?: string;
  invoiceNumber?: string;
  customerName: string;
  amount: number;
  status: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  paymentDate?: string;
  paymentMethod?: string;
  stripePaymentId?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    email: string;
  };
}

function PaymentStatusBadge({ status }: { status: Payment['status'] }) {
  const variants = {
    Pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
    Paid: { icon: CheckCircle, color: 'bg-green-100 text-green-800' },
    Failed: { icon: XCircle, color: 'bg-red-100 text-red-800' },
    Refunded: { icon: XCircle, color: 'bg-gray-100 text-gray-800' }
  };

  const { icon: Icon, color } = variants[status];

  return (
    <Badge className={`${color} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
}

export function PaymentsPage() {
  const { addToast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPaymentForm, setShowAddPaymentForm] = useState(false);
  const [newPayment, setNewPayment] = useState({
    invoiceNumber: '',
    customerName: '',
    amount: '',
    status: 'Paid' as Payment['status'],
    paymentMethod: 'cash',
    paymentDate: new Date().toISOString().split('T')[0],
    description: ''
  });

  // Fetch payments from API
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payments');
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      } else {
        console.error('Failed to fetch payments');
        addToast({
          type: 'error',
          title: 'Error',
          description: 'Failed to fetch payments'
        });
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to fetch payments'
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleProcessPayment = async (payment: Payment) => {
    if (payment.status !== 'Pending') return;

    setLoading(true);
    try {
      const result = await createStripeCheckoutSession(
        payment.invoiceId || payment.id,
        payment.amount,
        `Payment for ${payment.invoiceNumber || 'Payment'} - ${payment.customerName}`
      );

      if ('sessionUrl' in result) {
        window.location.href = result.sessionUrl;
      } else {
        console.error('Payment error:', result.error);

        // Handle specific Stripe configuration error
        if (result.error.includes('not configured')) {
          alert('Payment processing is currently being set up. Please contact support for assistance with payments.');
        } else if (result.error.includes('connection to Stripe')) {
          alert('Unable to connect to payment processor. Please try again later or contact support.');
        } else {
          alert(`Payment Error: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('Failed to process payment. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (confirm('Are you sure you want to delete this payment entry? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/payments/${paymentId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setPayments(payments.filter(payment => payment.id !== paymentId));
          addToast({
            type: 'success',
            title: 'Payment Deleted',
            description: 'The payment entry has been successfully removed.'
          });
        } else {
          const error = await response.json();
          addToast({
            type: 'error',
            title: 'Delete Failed',
            description: error.error || 'Failed to delete payment'
          });
        }
      } catch (error) {
        console.error('Error deleting payment:', error);
        addToast({
          type: 'error',
          title: 'Delete Failed',
          description: 'Failed to delete payment'
        });
      }
    }
  };

  const handleAddPayment = async () => {
    // Validation
    if (!newPayment.customerName || !newPayment.amount || !newPayment.invoiceNumber) {
      addToast({
        type: 'warning',
        title: 'Validation Error',
        description: 'Please fill in all required fields (invoice number, customer name, and amount).'
      });
      return;
    }

    const amount = parseFloat(newPayment.amount);
    if (isNaN(amount) || amount <= 0) {
      addToast({
        type: 'warning',
        title: 'Invalid Amount',
        description: 'Please enter a valid amount greater than 0.'
      });
      return;
    }

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          invoiceNumber: newPayment.invoiceNumber,
          customerName: newPayment.customerName,
          amount: amount,
          status: newPayment.status,
          paymentDate: newPayment.paymentDate,
          paymentMethod: newPayment.paymentMethod,
          description: newPayment.description
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(prev => [data.payment, ...prev]);

        addToast({
          type: 'success',
          title: 'Payment Added',
          description: 'Manual payment entry has been successfully added.'
        });

        // Reset form and close modal
        setNewPayment({
          invoiceNumber: '',
          customerName: '',
          amount: '',
          status: 'Paid',
          paymentMethod: 'cash',
          paymentDate: new Date().toISOString().split('T')[0],
          description: ''
        });
        setShowAddPaymentForm(false);
      } else {
        const error = await response.json();
        addToast({
          type: 'error',
          title: 'Failed to Add Payment',
          description: error.error || 'Failed to add payment'
        });
      }
    } catch (error) {
      console.error('Error adding payment:', error);
      addToast({
        type: 'error',
        title: 'Failed to Add Payment',
        description: 'Failed to add payment'
      });
    }
  };

  const stats = {
    totalPaid: payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0),
    totalPending: payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0),
    totalPayments: payments.length,
    successRate: payments.length > 0 ? Math.round((payments.filter(p => p.status === 'Paid').length / payments.length) * 100) : 0
  };

  if (loading && payments.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Payments</h1>
            <p className="text-muted-foreground">Track and process invoice payments via Stripe</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p>Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">Track and process invoice payments via Stripe</p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={() => setShowAddPaymentForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Payment
          </Button>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium">Powered by Stripe</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalPaid)}
                </div>
                <div className="text-sm text-muted-foreground">Total Paid</div>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(stats.totalPending)}
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.totalPayments}</div>
                <div className="text-sm text-muted-foreground">Total Payments</div>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.successRate}%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    {payment.invoiceNumber || 'N/A'}
                  </TableCell>
                  <TableCell>{payment.customerName}</TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell>
                    {payment.paymentDate ? formatDate(payment.paymentDate) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {payment.status === 'Pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleProcessPayment(payment)}
                          disabled={loading}
                          className="flex items-center gap-1"
                        >
                          <CreditCard className="h-3 w-3" />
                          Pay Now
                        </Button>
                      )}
                      {payment.status === 'Paid' && payment.stripePaymentId && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`https://dashboard.stripe.com/payments/${payment.stripePaymentId}`, '_blank')}
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View in Stripe
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeletePayment(payment.id)}
                        className="flex items-center gap-1"
                        title="Delete payment entry"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {payments.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payments found</p>
              <p className="text-sm">Add your first payment to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Payment Modal */}
      {showAddPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add Manual Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  value={newPayment.invoiceNumber}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  placeholder="INV-2024-001"
                />
              </div>

              <div>
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={newPayment.customerName}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Customer name"
                />
              </div>

              <div>
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={newPayment.status} onValueChange={(value: Payment['status']) => setNewPayment(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                    <SelectItem value="Refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={newPayment.paymentMethod} onValueChange={(value) => setNewPayment(prev => ({ ...prev, paymentMethod: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="card">Credit Card</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={newPayment.paymentDate}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, paymentDate: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowAddPaymentForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddPayment}>
                  Add Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 