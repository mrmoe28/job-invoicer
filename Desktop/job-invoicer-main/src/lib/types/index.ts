export interface CustomerFormData {
  customerType: 'residential' | 'commercial';
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  phone: string;
  notifyByEmail: boolean;
  notifyBySmsText: boolean;
  additionalInfo: {
    company?: string;
    address?: string;
    notes?: string;
  };
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
  company?: string;
  contactPerson?: string;
  customerType?: 'residential' | 'commercial';
  createdAt: Date;
  updatedAt: Date;
}

export interface Job {
  id: string;
  customerId: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  amount: number;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  jobId: string;
  customerId: string;
  invoiceNumber: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}