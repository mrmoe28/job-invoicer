'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Plus } from 'lucide-react';

interface CustomerFormData {
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

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customerData: CustomerFormData) => Promise<void>;
  customer?: CustomerFormData | null;
}

export function CustomerForm({ isOpen, onClose, onSave, customer }: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerFormData>({
    customerType: 'residential',
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    phone: '',
    notifyByEmail: true,
    notifyBySmsText: true,
    additionalInfo: {},
    ...customer
  });

  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.firstName.trim()) {
      alert('Please provide a first name');
      return;
    }
    
    if (!formData.email.trim()) {
      alert('Please provide an email address');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      alert('Please provide a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      handleClose();
    } catch (error) {
      console.error('Error saving customer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      customerType: 'residential',
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      phone: '',
      notifyByEmail: true,
      notifyBySmsText: true,
      additionalInfo: {}
    });
    setShowAdditionalInfo(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-full mx-4">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-semibold">New Customer</DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 min-w-[32px] min-h-[32px]"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Type */}
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-3 block">Customer Type</Label>
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.customerType === 'residential'}
                  onChange={() => setFormData({ ...formData, customerType: 'residential' })}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Residential</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.customerType === 'commercial'}
                  onChange={() => setFormData({ ...formData, customerType: 'commercial' })}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Commercial</span>
              </label>
            </div>
          </div>

          {/* Contact Name */}
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-3 block">
              Contact Name <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                className="border-gray-300"
              />
              <Input
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="border-gray-300"
              />
            </div>
          </div>

          {/* Contact Email */}
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-3 block">
              Contact Email <span className="text-red-500">*</span>
            </Label>
            <Input
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="border-gray-300"
            />
          </div>

          {/* Mobile and Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-3 block">
                Mobile <span className="text-xs text-gray-500 block sm:inline">(to send SMS/Text alerts to customer)</span>
              </Label>
              <Input
                type="tel"
                placeholder="Mobile number"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="border-gray-300"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-3 block">
                Phone <span className="text-xs text-gray-500 block sm:inline">(other phone number, e.g. landline)</span>
              </Label>
              <Input
                type="tel"
                placeholder="Phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="border-gray-300"
              />
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.notifyByEmail}
                onChange={(e) => setFormData({ ...formData, notifyByEmail: e.target.checked })}
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Notify by Email</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.notifyBySmsText}
                onChange={(e) => setFormData({ ...formData, notifyBySmsText: e.target.checked })}
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Notify by SMS/Text</span>
            </label>
          </div>

          {/* Add More Info */}
          <div>
            <Button
              type="button"
              variant="link"
              onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
              className="text-green-600 p-0 h-auto font-medium"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add More Info
            </Button>
          </div>

          {/* Additional Info Section */}
          {showAdditionalInfo && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-gray-900 mb-2 block">Company</Label>
                <Input
                  placeholder="Company name"
                  value={formData.additionalInfo.company || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    additionalInfo: { ...formData.additionalInfo, company: e.target.value }
                  })}
                  className="border-gray-300"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-900 mb-2 block">Address</Label>
                <Input
                  placeholder="Full address"
                  value={formData.additionalInfo.address || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    additionalInfo: { ...formData.additionalInfo, address: e.target.value }
                  })}
                  className="border-gray-300"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-900 mb-2 block">Notes</Label>
                <Input
                  placeholder="Additional notes"
                  value={formData.additionalInfo.notes || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    additionalInfo: { ...formData.additionalInfo, notes: e.target.value }
                  })}
                  className="border-gray-300"
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.firstName.trim() || !formData.email.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 