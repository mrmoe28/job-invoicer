'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Customer } from '@/lib/types';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Mail, 
  Phone, 
  MapPin,
  Building,
  User
} from 'lucide-react';
import { CustomerForm } from '@/components/customer-form';

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  company: string;
  contactPerson: string;
}

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    contactPerson: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.company && customer.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      company: '',
      contactPerson: ''
    });
    setEditingCustomer(null);
  };

  const handleOpenDialog = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        address: customer.address || '',
        company: customer.company || '',
        contactPerson: customer.contactPerson || ''
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleViewCustomer = (customer: Customer) => {
    setViewingCustomer(customer);
    setIsViewDialogOpen(true);
  };

  const handleOpenForm = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer({
        customerType: customer.company ? 'commercial' : 'residential',
        firstName: customer.name?.split(' ')[0] || '',
        lastName: customer.name?.split(' ').slice(1).join(' ') || '',
        email: customer.email || '',
        mobile: customer.phone || '',
        phone: '',
        notifyByEmail: true,
        notifyBySmsText: true,
        additionalInfo: {
          company: customer.company || '',
          address: customer.address || '',
          notes: ''
        }
      });
    } else {
      setEditingCustomer(null);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCustomer(null);
  };

  const handleSaveCustomer = async (customerData: {
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    phone: string;
    customerType: string;
    notifyByEmail: boolean;
    notifyBySmsText: boolean;
    additionalInfo?: {
      company?: string;
      address?: string;
      notes?: string;
    };
  }) => {
    try {
      // Ensure we have at least a name before proceeding
      const fullName = `${customerData.firstName} ${customerData.lastName}`.trim();
      if (!fullName || !customerData.firstName) {
        alert('Please provide at least a first name for the customer');
        throw new Error('Name is required');
      }

      // Email is required by the API
      if (!customerData.email || !customerData.email.trim()) {
        alert('Please provide an email address for the customer');
        throw new Error('Email is required');
      }

      const customerPayload = {
        name: fullName,
        email: customerData.email.trim(),
        phone: customerData.mobile || customerData.phone || null,
        company: customerData.additionalInfo?.company || null,
        address: customerData.additionalInfo?.address || null,
        contactPerson: fullName,
        customerType: customerData.customerType,
        notifyByEmail: customerData.notifyByEmail,
        notifyBySmsText: customerData.notifyBySmsText
      };

      console.log('💾 Saving customer:', customerPayload);

      let response;
      if (editingCustomer) {
        response = await fetch(`/api/customers/${editingCustomer.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customerPayload),
        });
      } else {
        response = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customerPayload),
        });
      }

      const responseData = await response.json();

      if (!response.ok) {
        console.error('❌ API Error:', response.status, responseData);
        
        if (response.status === 409) {
          // Handle duplicate customer error
          const errorMessage = responseData.error || 'A customer with this email already exists';
          alert(`Cannot create customer: ${errorMessage}`);
          throw new Error(errorMessage);
        } else if (response.status === 400) {
          // Handle validation errors
          const errorMessage = responseData.error || 'Please check your input data';
          alert(`Validation Error: ${errorMessage}`);
          throw new Error(errorMessage);
        } else {
          // Handle other errors
          const errorMessage = responseData.error || 'Failed to save customer';
          alert(`Error: ${errorMessage}`);
          throw new Error(errorMessage);
        }
      }

      console.log('✅ Customer saved successfully:', responseData);
      alert('Customer saved successfully!');
      await fetchCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
      // Don't throw the error again as we've already shown the alert
      // Just log it for debugging
    }
  };

  const handleDelete = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchCustomers();
        alert('Customer deleted successfully!');
      } else {
        throw new Error('Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Failed to delete customer');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customer database</p>
        </div>
        <Button 
          className="bg-green-600 hover:bg-green-700"
          onClick={() => handleOpenForm()}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Customer Form */}
      <CustomerForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSaveCustomer}
        customer={editingCustomer}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Companies</p>
                <p className="text-2xl font-bold">
                  {customers.filter(c => c.company).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Mail className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">With Email</p>
                <p className="text-2xl font-bold">
                  {customers.filter(c => c.email).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Phone className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">With Phone</p>
                <p className="text-2xl font-bold">
                  {customers.filter(c => c.phone).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search customers by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Database</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No customers found' : 'No customers yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Get started by adding your first customer'
                }
              </p>
              {!searchTerm && (
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleOpenForm()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            {customer.contactPerson && (
                              <p className="text-sm text-gray-500">
                                Contact: {customer.contactPerson}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.company ? (
                          <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                            {customer.company}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span>{customer.email}</span>
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.address ? (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span className="truncate max-w-[200px]" title={customer.address}>
                              {customer.address}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewCustomer(customer)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenForm(customer)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(customer.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Customer Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {viewingCustomer && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{viewingCustomer.name}</h3>
                  {viewingCustomer.company && (
                    <Badge className="bg-blue-50 text-blue-700">
                      {viewingCustomer.company}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{viewingCustomer.email}</span>
                </div>
                
                {viewingCustomer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{viewingCustomer.phone}</span>
                  </div>
                )}
                
                {viewingCustomer.contactPerson && (
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>Contact: {viewingCustomer.contactPerson}</span>
                  </div>
                )}
                
                {viewingCustomer.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                    <span>{viewingCustomer.address}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleOpenForm(viewingCustomer);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 