'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/core/layouts/DashboardLayout';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { useNotifications } from '@/components/providers/NotificationProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Upload,
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Pen,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Document {
  id: string;
  fileName: string;
  title?: string;
  fileType: string;
  fileSize: number;
  category: string;
  status: 'active' | 'archived' | 'deleted';
  uploadedBy: string;
  createdAt: string;
  signatures?: DocumentSignature[];
  hasSignatures: boolean;
}

interface DocumentSignature {
  id: string;
  signerName: string;
  signerEmail: string;
  status: 'pending' | 'signed' | 'declined' | 'expired';
  signedAt?: string;
  signerRole?: string;
}

export default function DocumentsPage() {
  const { user } = useAuthContext();
  const { success, error } = useNotifications();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - in production, this would come from API calls
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDocuments([
        {
          id: '1',
          fileName: 'solar_installation_contract.pdf',
          title: 'Solar Installation Contract - Johnson Residence',
          fileType: 'pdf',
          fileSize: 2458000,
          category: 'contract',
          status: 'active',
          uploadedBy: 'John Smith',
          createdAt: '2024-12-28T10:30:00Z',
          hasSignatures: true,
          signatures: [
            {
              id: '1',
              signerName: 'Sarah Johnson',
              signerEmail: 'sarah.johnson@email.com',
              status: 'signed',
              signedAt: '2024-12-28T14:20:00Z',
              signerRole: 'customer'
            },
            {
              id: '2',
              signerName: 'Mike Davis',
              signerEmail: 'mike.davis@pulsecrm.com',
              status: 'signed',
              signedAt: '2024-12-28T15:45:00Z',
              signerRole: 'contractor'
            }
          ]
        },
        {
          id: '2',
          fileName: 'permit_application_williams.pdf',
          title: 'Building Permit Application - Williams Property',
          fileType: 'pdf',
          fileSize: 1892000,
          category: 'permit',
          status: 'active',
          uploadedBy: 'Lisa Chen',
          createdAt: '2024-12-27T09:15:00Z',
          hasSignatures: true,
          signatures: [
            {
              id: '3',
              signerName: 'Robert Williams',
              signerEmail: 'robert.williams@email.com',
              status: 'pending',
              signerRole: 'property_owner'
            }
          ]
        },
        {
          id: '3',
          fileName: 'energy_assessment_martinez.pdf',
          title: 'Energy Assessment Report - Martinez Home',
          fileType: 'pdf',
          fileSize: 3421000,
          category: 'assessment',
          status: 'active',
          uploadedBy: 'Tom Wilson',
          createdAt: '2024-12-26T16:20:00Z',
          hasSignatures: false,
          signatures: []
        },
        {
          id: '4',
          fileName: 'warranty_documentation_garcia.pdf',
          title: 'Solar Panel Warranty - Garcia Installation',
          fileType: 'pdf',
          fileSize: 1567000,
          category: 'warranty',
          status: 'active',
          uploadedBy: 'Anna Rodriguez',
          createdAt: '2024-12-25T11:10:00Z',
          hasSignatures: true,
          signatures: [
            {
              id: '4',
              signerName: 'Carlos Garcia',
              signerEmail: 'carlos.garcia@email.com',
              status: 'declined',
              signerRole: 'customer'
            }
          ]
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.title?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSignatureStatus = (document: Document) => {
    if (!document.hasSignatures) {
      return { status: 'none', label: 'No signatures required', color: 'bg-gray-100 text-gray-800' };
    }

    const signatures = document.signatures || [];
    const pending = signatures.filter(s => s.status === 'pending').length;
    const signed = signatures.filter(s => s.status === 'signed').length;
    const declined = signatures.filter(s => s.status === 'declined').length;
    const total = signatures.length;

    if (declined > 0) {
      return { status: 'declined', label: 'Signature declined', color: 'bg-red-100 text-red-800' };
    }
    if (signed === total) {
      return { status: 'complete', label: 'All signed', color: 'bg-green-100 text-green-800' };
    }
    if (pending > 0) {
      return { status: 'pending', label: `${pending} pending`, color: 'bg-yellow-100 text-yellow-800' };
    }

    return { status: 'none', label: 'No signatures', color: 'bg-gray-100 text-gray-800' };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      success(`File "${file.name}" uploaded successfully!`);
      setIsUploadOpen(false);
      // In production, this would upload to the server
    }
  };

  const handleRequestSignature = (documentId: string) => {
    success('Signature request sent successfully!');
    // In production, this would send signature requests
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'contract', label: 'Contracts' },
    { value: 'permit', label: 'Permits' },
    { value: 'assessment', label: 'Assessments' },
    { value: 'warranty', label: 'Warranties' },
    { value: 'proposal', label: 'Proposals' },
    { value: 'invoice', label: 'Invoices' }
  ];

  return (
    <DashboardLayout
      title="Documents"
      subtitle="Manage contracts, permits, and other solar project documents with e-signature capabilities."
      sidebarCollapsed={sidebarCollapsed}
      onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
    >
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white text-sm"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload New Document</DialogTitle>
                <DialogDescription>
                  Upload a PDF document and configure signature requirements.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select File
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category
                  </label>
                  <select className="w-full px-3 py-2 border rounded-md">
                    <option value="contract">Contract</option>
                    <option value="permit">Permit</option>
                    <option value="assessment">Assessment</option>
                    <option value="warranty">Warranty</option>
                    <option value="proposal">Proposal</option>
                    <option value="invoice">Invoice</option>
                  </select>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Documents ({filteredDocuments.length})</CardTitle>
          <CardDescription>
            Manage and track document signatures for your solar projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No documents found</p>
              <p className="text-sm">Upload your first document to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map((document) => {
                const signatureStatus = getSignatureStatus(document);
                
                return (
                  <div key={document.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex-shrink-0">
                          <FileText className="h-8 w-8 text-red-600" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {document.title || document.fileName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {document.fileName} • {formatFileSize(document.fileSize)}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Uploaded by {document.uploadedBy} on {formatDate(document.createdAt)}
                          </p>
                          
                          {/* Signature Status */}
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className={signatureStatus.color}>
                              {signatureStatus.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                              {signatureStatus.status === 'complete' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {signatureStatus.status === 'declined' && <AlertTriangle className="h-3 w-3 mr-1" />}
                              {signatureStatus.label}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {document.category}
                            </Badge>
                          </div>
                          
                          {/* Signature Details */}
                          {document.hasSignatures && document.signatures && document.signatures.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {document.signatures.map((signature) => (
                                <div key={signature.id} className="flex items-center text-xs text-gray-600">
                                  <span className="font-medium">{signature.signerName}</span>
                                  <span className="mx-1">•</span>
                                  <span className={
                                    signature.status === 'signed' ? 'text-green-600' :
                                    signature.status === 'declined' ? 'text-red-600' :
                                    'text-yellow-600'
                                  }>
                                    {signature.status === 'signed' && signature.signedAt 
                                      ? `Signed ${formatDate(signature.signedAt)}`
                                      : signature.status.charAt(0).toUpperCase() + signature.status.slice(1)
                                    }
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        {document.hasSignatures && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRequestSignature(document.id)}
                          >
                            <Pen className="h-4 w-4 mr-1" />
                            Sign
                          </Button>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Pen className="h-4 w-4 mr-2" />
                              Request Signature
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              Archive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Pending Signatures</p>
                <p className="text-2xl font-bold text-gray-900">
                  {documents.reduce((acc, doc) => 
                    acc + (doc.signatures?.filter(s => s.status === 'pending').length || 0), 0
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {documents.filter(doc => {
                    const signatures = doc.signatures || [];
                    return signatures.length > 0 && signatures.every(s => s.status === 'signed');
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Needs Attention</p>
                <p className="text-2xl font-bold text-gray-900">
                  {documents.reduce((acc, doc) => 
                    acc + (doc.signatures?.filter(s => s.status === 'declined').length || 0), 0
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
