'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import DashboardLayout from '../../../components/dashboard-layout';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  type: string;
  dateAdded: string;
  lastContact: string;
  status: string;
}

interface ColumnSetting {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [editingCell, setEditingCell] = useState<{contactId: string, field: string} | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [viewContact, setViewContact] = useState<Contact | null>(null);
  const [addForm, setAddForm] = useState({
    name: '', email: '', phone: '', company: '', type: 'Client', status: 'Active'
  });

  // CSV Upload states
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [csvMapping, setCsvMapping] = useState<{[key: string]: string}>({});
  const [csvImportStep, setCsvImportStep] = useState(1); // 1: Upload, 2: Mapping, 3: Preview
  const [isImporting, setIsImporting] = useState(false);
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  const [columnSettings, setColumnSettings] = useState<ColumnSetting[]>([
    { id: 'name', label: 'Name', visible: true, order: 0 },
    { id: 'email', label: 'Email', visible: true, order: 1 },
    { id: 'phone', label: 'Phone', visible: true, order: 2 },
    { id: 'company', label: 'Company', visible: true, order: 3 },
    { id: 'type', label: 'Type', visible: true, order: 4 },
    { id: 'dateAdded', label: 'Date Added', visible: false, order: 5 },
    { id: 'lastContact', label: 'Last Contact', visible: false, order: 6 },
    { id: 'status', label: 'Status', visible: true, order: 7 },
    { id: 'actions', label: 'Actions', visible: true, order: 8 }
  ]);

  const [contacts, setContacts] = useState<Contact[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('contacts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('contacts', JSON.stringify(contacts));
      localStorage.setItem('contactsViewMode', viewMode);
    }
  }, [contacts, viewMode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('contactsViewMode');
      if (saved) setViewMode(saved);
    }
  }, []);

  const handleAddContact = useCallback(() => {
    setAddForm({ name: '', email: '', phone: '', company: '', type: 'Client', status: 'Active' });
    setShowAddModal(true);
  }, []);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value);
  }, []);

  const handleViewChange = useCallback((mode: string) => {
    setViewMode(mode);
  }, []);

  const handleShowFilters = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);

  const handleColumnSettings = useCallback(() => {
    setShowColumnSettings(!showColumnSettings);
  }, [showColumnSettings]);

  const handleColumnToggle = useCallback((columnId: string) => {
    setColumnSettings(prev => prev.map(col => 
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  }, []);

  const handleColumnReorder = useCallback((columnId: string, direction: 'up' | 'down') => {
    setColumnSettings(prev => {
      const columns = [...prev];
      const currentIndex = columns.findIndex(col => col.id === columnId);
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      if (newIndex >= 0 && newIndex < columns.length) {
        const temp = columns[currentIndex].order;
        columns[currentIndex].order = columns[newIndex].order;
        columns[newIndex].order = temp;
        
        return columns.sort((a, b) => a.order - b.order);
      }
      return columns;
    });
  }, []);

  const getVisibleColumns = useCallback(() => {
    return columnSettings.filter(col => col.visible).sort((a, b) => a.order - b.order);
  }, [columnSettings]);

  const handleViewContact = useCallback((contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    setViewContact(contact || null);
  }, [contacts]);

  const handleEditContact = useCallback((contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) setAddForm(contact);
    setEditContact(contact || null);
    setShowAddModal(true);
  }, [contacts]);

  const handleDeleteContact = useCallback((contactId: string) => {
    setContacts(prev => prev.filter(contact => contact.id !== contactId));
    setSelectedContacts(prev => prev.filter(id => id !== contactId));
  }, []);

  const handleSelectContact = useCallback((contactId: string, checked: boolean) => {
    if (checked) {
      setSelectedContacts(prev => [...prev, contactId]);
    } else {
      setSelectedContacts(prev => prev.filter(id => id !== contactId));
    }
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedContacts(contacts.map(contact => contact.id));
    } else {
      setSelectedContacts([]);
    }
  }, [contacts]);

  const handleCellEdit = useCallback((contactId: string, field: string, currentValue: string) => {
    setEditingCell({ contactId, field });
    setEditingValue(currentValue);
  }, []);

  const handleCellSave = useCallback((contactId: string, field: string) => {
    setContacts(prev => prev.map(contact => 
      contact.id === contactId ? { ...contact, [field]: editingValue } : contact
    ));
    setEditingCell(null);
    setEditingValue('');
  }, [editingValue]);

  const handleCellCancel = useCallback(() => {
    setEditingCell(null);
    setEditingValue('');
  }, []);

  const handleSaveContact = () => {
    if (!addForm.name.trim() || !addForm.email.trim()) return;
    if (editContact) {
      setContacts(prev => prev.map(c => c.id === editContact.id ? { ...c, ...addForm } : c));
      setEditContact(null);
    } else {
      setContacts(prev => [
        ...prev,
        {
          ...addForm,
          id: `${addForm.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
          dateAdded: new Date().toISOString(),
          lastContact: new Date().toISOString(),
        }
      ]);
    }
    setShowAddModal(false);
  };

  // CSV Upload Functions
  const handleCSVUpload = () => {
    setShowCSVModal(true);
    setCsvImportStep(1);
    setCsvFile(null);
    setCsvPreview([]);
    setCsvMapping({});
  };

  const handleCSVFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      parseCSVFile(file);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const parseCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const data = lines.slice(1, 6).map(line => { // Preview first 5 rows
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });
      
      setCsvPreview(data);
      
      // Auto-map common column names
      const autoMapping: {[key: string]: string} = {};
      headers.forEach(header => {
        const lowerHeader = header.toLowerCase();
        if (lowerHeader.includes('name') && !lowerHeader.includes('company')) {
          autoMapping['name'] = header;
        } else if (lowerHeader.includes('email')) {
          autoMapping['email'] = header;
        } else if (lowerHeader.includes('phone')) {
          autoMapping['phone'] = header;
        } else if (lowerHeader.includes('company') || lowerHeader.includes('organization')) {
          autoMapping['company'] = header;
        } else if (lowerHeader.includes('type') || lowerHeader.includes('category')) {
          autoMapping['type'] = header;
        } else if (lowerHeader.includes('status')) {
          autoMapping['status'] = header;
        }
      });
      
      setCsvMapping(autoMapping);
      setCsvImportStep(2);
    };
    reader.readAsText(file);
  };

  const handleMappingChange = (field: string, csvColumn: string) => {
    setCsvMapping(prev => ({ ...prev, [field]: csvColumn }));
  };

  const getCSVHeaders = () => {
    if (csvPreview.length === 0) return [];
    return Object.keys(csvPreview[0]);
  };

  const handleImportContacts = async () => {
    if (!csvFile) return;
    
    setIsImporting(true);
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        const newContacts: Contact[] = [];
        
        lines.slice(1).forEach((line, index) => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row: any = {};
          headers.forEach((header, headerIndex) => {
            row[header] = values[headerIndex] || '';
          });
          
          // Map CSV columns to contact fields
          const contact: Contact = {
            id: `csv-import-${Date.now()}-${index}`,
            name: row[csvMapping.name] || '',
            email: row[csvMapping.email] || '',
            phone: row[csvMapping.phone] || '',
            company: row[csvMapping.company] || '',
            type: row[csvMapping.type] || 'Client',
            status: row[csvMapping.status] || 'Active',
            dateAdded: new Date().toISOString(),
            lastContact: new Date().toISOString(),
          };
          
          // Only add contacts with at least name and email
          if (contact.name.trim() && contact.email.trim()) {
            newContacts.push(contact);
          }
        });
        
        // Add new contacts to existing ones
        setContacts(prev => [...prev, ...newContacts]);
        
        // Close modal and reset
        setShowCSVModal(false);
        setCsvImportStep(1);
        setCsvFile(null);
        setCsvPreview([]);
        setCsvMapping({});
        
        alert(`Successfully imported ${newContacts.length} contacts!`);
      };
      reader.readAsText(csvFile);
    } catch (error) {
      console.error('Error importing CSV:', error);
      alert('Error importing CSV file. Please check the format and try again.');
    } finally {
      setIsImporting(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showColumnSettings) {
        const target = event.target as Element;
        if (!target.closest('.column-settings-panel') && !target.closest('.columns-button')) {
          setShowColumnSettings(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColumnSettings]);

  return (
    <DashboardLayout title="Contact Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex space-x-3">
            <button 
              onClick={handleAddContact}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Add Contact
            </button>
            
            <button 
              onClick={handleCSVUpload}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Import CSV
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-64 pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <svg className="w-4 h-4 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <select 
              value={filterType}
              onChange={handleFilterChange}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Filter by Type</option>
              <option value="client">Client</option>
              <option value="supplier">Supplier</option>
              <option value="contractor">Contractor</option>
              <option value="employee">Employee</option>
            </select>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Contacts</h3>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleViewChange('list')}
                    className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}
                    title="List view"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleViewChange('grid')}
                    className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}
                    title="Grid view"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                </div>
                
                <button 
                  onClick={handleShowFilters}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-gray-300 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter
                </button>
                
                <div className="relative">
                  <button 
                    onClick={handleColumnSettings}
                    className="columns-button px-4 py-2 bg-gray-600 hover:bg-gray-500 text-gray-300 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                    </svg>
                    Columns
                  </button>
                  
                  {showColumnSettings && (
                    <div className="column-settings-panel absolute right-0 top-12 w-80 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-20 p-4">
                      <h4 className="text-white font-medium mb-3">Customize Columns</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {columnSettings.map((column) => (
                          <div key={column.id} className="flex items-center justify-between">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={column.visible}
                                onChange={() => handleColumnToggle(column.id)}
                                className="rounded bg-gray-600 border-gray-500 text-orange-500 focus:ring-orange-500"
                              />
                              <span className="text-gray-300 text-sm">{column.label}</span>
                            </label>
                            <div className="flex space-x-1">
                              <button 
                                onClick={() => handleColumnReorder(column.id, 'up')}
                                disabled={column.order === 0}
                                className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                title={`Move ${column.label} up`}
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleColumnReorder(column.id, 'down')}
                                disabled={column.order === columnSettings.length - 1}
                                className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                title={`Move ${column.label} down`}
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {viewMode === 'list' && (
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left p-4 text-gray-300 font-medium">
                      <input 
                        type="checkbox" 
                        checked={selectedContacts.length === contacts.length && contacts.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded bg-gray-600 border-gray-500"
                        aria-label="Select all contacts"
                      />
                    </th>
                    {getVisibleColumns().map((column) => (
                      <th key={column.id} className={`text-left p-4 text-gray-300 font-medium ${column.id === 'actions' ? 'text-center' : ''}`}>
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => {
                    const getTypeColor = (type: string) => {
                      switch (type) {
                        case 'Client': return 'bg-blue-600';
                        case 'Supplier': return 'bg-green-600';
                        case 'Contractor': return 'bg-purple-600';
                        case 'Employee': return 'bg-orange-600';
                        default: return 'bg-gray-600';
                      }
                    };

                    const formatDate = (dateString: string) => {
                      return new Date(dateString).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      });
                    };

                    const renderColumnContent = (columnId: string) => {
                      const isEditing = editingCell?.contactId === contact.id && editingCell?.field === columnId;
                      const editableFields = ['name', 'email', 'phone', 'company', 'type', 'status'];
                      
                      if (isEditing && editableFields.includes(columnId)) {
                        if (columnId === 'type') {
                          return (
                            <select
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onBlur={() => handleCellSave(contact.id, columnId)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCellSave(contact.id, columnId);
                                if (e.key === 'Escape') handleCellCancel();
                              }}
                              className="bg-gray-700 text-white px-2 py-1 rounded text-sm border border-orange-500 focus:outline-none"
                              autoFocus
                            >
                              <option value="Client">Client</option>
                              <option value="Supplier">Supplier</option>
                              <option value="Contractor">Contractor</option>
                              <option value="Employee">Employee</option>
                            </select>
                          );
                        } else if (columnId === 'status') {
                          return (
                            <select
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onBlur={() => handleCellSave(contact.id, columnId)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCellSave(contact.id, columnId);
                                if (e.key === 'Escape') handleCellCancel();
                              }}
                              className="bg-gray-700 text-white px-2 py-1 rounded text-sm border border-orange-500 focus:outline-none"
                              autoFocus
                            >
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                          );
                        } else {
                          return (
                            <input
                              type="text"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onBlur={() => handleCellSave(contact.id, columnId)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCellSave(contact.id, columnId);
                                if (e.key === 'Escape') handleCellCancel();
                              }}
                              className="bg-gray-700 text-white px-2 py-1 rounded text-sm border border-orange-500 focus:outline-none w-full"
                              autoFocus
                            />
                          );
                        }
                      }

                      switch (columnId) {
                        case 'name':
                          return (
                            <span 
                              className="text-white font-medium cursor-pointer hover:bg-gray-600 px-1 py-1 rounded"
                              onClick={() => handleCellEdit(contact.id, 'name', contact.name)}
                              title="Click to edit"
                            >
                              {contact.name}
                            </span>
                          );
                        case 'email':
                          return (
                            <span 
                              className="text-gray-300 cursor-pointer hover:bg-gray-600 px-1 py-1 rounded"
                              onClick={() => handleCellEdit(contact.id, 'email', contact.email)}
                              title="Click to edit"
                            >
                              {contact.email}
                            </span>
                          );
                        case 'phone':
                          return (
                            <span 
                              className="text-gray-300 cursor-pointer hover:bg-gray-600 px-1 py-1 rounded"
                              onClick={() => handleCellEdit(contact.id, 'phone', contact.phone)}
                              title="Click to edit"
                            >
                              {contact.phone}
                            </span>
                          );
                        case 'company':
                          return (
                            <span 
                              className="text-gray-300 cursor-pointer hover:bg-gray-600 px-1 py-1 rounded"
                              onClick={() => handleCellEdit(contact.id, 'company', contact.company)}
                              title="Click to edit"
                            >
                              {contact.company}
                            </span>
                          );
                        case 'type':
                          return (
                            <span 
                              className={`${getTypeColor(contact.type)} text-white px-2 py-1 rounded text-sm cursor-pointer hover:opacity-80`}
                              onClick={() => handleCellEdit(contact.id, 'type', contact.type)}
                              title="Click to edit"
                            >
                              {contact.type}
                            </span>
                          );
                        case 'dateAdded':
                          return <span className="text-gray-300">{formatDate(contact.dateAdded)}</span>;
                        case 'lastContact':
                          return <span className="text-gray-300">{formatDate(contact.lastContact)}</span>;
                        case 'status':
                          return (
                            <span 
                              className={`${contact.status === 'Active' ? 'bg-green-600' : 'bg-red-600'} text-white px-2 py-1 rounded text-sm cursor-pointer hover:opacity-80`}
                              onClick={() => handleCellEdit(contact.id, 'status', contact.status)}
                              title="Click to edit"
                            >
                              {contact.status}
                            </span>
                          );
                        case 'actions':
                          return (
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleViewContact(contact.id)}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                title="View contact"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              </button>
                              <button 
                                onClick={() => handleEditContact(contact.id)}
                                className="text-gray-400 hover:text-gray-300 transition-colors"
                                title="Edit contact"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              <button 
                                onClick={() => handleDeleteContact(contact.id)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                                title="Delete contact"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          );
                        default:
                          return null;
                      }
                    };

                    return (
                      <tr key={contact.id} className="border-t border-gray-700 hover:bg-gray-700">
                        <td className="p-4">
                          <input 
                            type="checkbox" 
                            checked={selectedContacts.includes(contact.id)}
                            onChange={(e) => handleSelectContact(contact.id, e.target.checked)}
                            className="rounded bg-gray-600 border-gray-500"
                            aria-label={`Select contact ${contact.name}`}
                          />
                        </td>
                        {getVisibleColumns().map((column) => (
                          <td key={column.id} className={`p-4 ${column.id === 'actions' ? 'text-center' : ''}`}>
                            {renderColumnContent(column.id)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            {viewMode === 'grid' && (
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {contacts.map((contact) => (
                  <div key={contact.id} className="bg-gray-700 rounded-xl p-5 shadow flex flex-col justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-white mb-2">{contact.name}</h4>
                      <div className="text-gray-300 text-sm mb-1">Email: {contact.email}</div>
                      <div className="text-gray-300 text-sm mb-1">Phone: {contact.phone}</div>
                      <div className="text-gray-300 text-sm mb-1">Company: {contact.company}</div>
                      <div className="text-gray-300 text-sm mb-1">Type: {contact.type}</div>
                      <div className="text-gray-300 text-sm mb-1">Status: {contact.status}</div>
                    </div>
                    <div className="flex items-center justify-end mt-4 space-x-2">
                      <button onClick={() => handleViewContact(contact.id)} className="text-blue-400 hover:text-blue-300" title="View contact">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                      <button onClick={() => handleEditContact(contact.id)} className="text-gray-400 hover:text-gray-300" title="Edit contact">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDeleteContact(contact.id)} className="text-red-400 hover:text-red-300" title="Delete contact">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Advanced Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                <input
                  type="text"
                  placeholder="Filter by company..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date Added</label>
                <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500">
                  <option value="">Any time</option>
                  <option value="today">Today</option>
                  <option value="week">This week</option>
                  <option value="month">This month</option>
                  <option value="year">This year</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500">
                  <option value="">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="prospect">Prospect</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button 
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors">
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">{editContact ? 'Edit Contact' : 'Add Contact'}</h3>
                <button
                  onClick={() => { setShowAddModal(false); setEditContact(null); }}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <input type="text" placeholder="Name" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400" />
                <input type="email" placeholder="Email" value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400" />
                <input type="text" placeholder="Phone" value={addForm.phone} onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400" />
                <input type="text" placeholder="Company" value={addForm.company} onChange={e => setAddForm(f => ({ ...f, company: e.target.value }))} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400" />
                <select value={addForm.type} onChange={e => setAddForm(f => ({ ...f, type: e.target.value }))} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
                  <option value="Client">Client</option>
                  <option value="Supplier">Supplier</option>
                  <option value="Contractor">Contractor</option>
                  <option value="Employee">Employee</option>
                </select>
                <select value={addForm.status} onChange={e => setAddForm(f => ({ ...f, status: e.target.value }))} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end mt-6">
                <button onClick={() => { setShowAddModal(false); setEditContact(null); }} className="px-4 py-2 text-gray-300 hover:text-white transition-colors">Cancel</button>
                <button onClick={handleSaveContact} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors ml-3">{editContact ? 'Save Changes' : 'Add Contact'}</button>
              </div>
            </div>
          </div>
        )}

        {viewContact && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Contact Details</h3>
                <button
                  onClick={() => setViewContact(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-2">
                <div><span className="font-medium text-gray-300">Name:</span> <span className="text-white">{viewContact.name}</span></div>
                <div><span className="font-medium text-gray-300">Email:</span> <span className="text-white">{viewContact.email}</span></div>
                <div><span className="font-medium text-gray-300">Phone:</span> <span className="text-white">{viewContact.phone}</span></div>
                <div><span className="font-medium text-gray-300">Company:</span> <span className="text-white">{viewContact.company}</span></div>
                <div><span className="font-medium text-gray-300">Type:</span> <span className="text-white">{viewContact.type}</span></div>
                <div><span className="font-medium text-gray-300">Status:</span> <span className="text-white">{viewContact.status}</span></div>
                <div><span className="font-medium text-gray-300">Date Added:</span> <span className="text-white">{(() => {
                  return new Date(viewContact.dateAdded).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                })()}</span></div>
                <div><span className="font-medium text-gray-300">Last Contact:</span> <span className="text-white">{(() => {
                  return new Date(viewContact.lastContact).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                })()}</span></div>
              </div>
              <div className="flex justify-end mt-6">
                <button onClick={() => setViewContact(null)} className="px-4 py-2 text-gray-300 hover:text-white transition-colors">Close</button>
              </div>
            </div>
          </div>
        )}

        {/* CSV Import Modal */}
        {showCSVModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Import Contacts from CSV</h3>
                <button
                  onClick={() => setShowCSVModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Step indicator */}
              <div className="flex items-center mb-6">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${csvImportStep >= 1 ? 'bg-orange-500 text-white' : 'bg-gray-600 text-gray-400'}`}>
                  1
                </div>
                <div className={`flex-1 h-1 mx-2 ${csvImportStep >= 2 ? 'bg-orange-500' : 'bg-gray-600'}`}></div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${csvImportStep >= 2 ? 'bg-orange-500 text-white' : 'bg-gray-600 text-gray-400'}`}>
                  2
                </div>
                <div className={`flex-1 h-1 mx-2 ${csvImportStep >= 3 ? 'bg-orange-500' : 'bg-gray-600'}`}></div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${csvImportStep >= 3 ? 'bg-orange-500 text-white' : 'bg-gray-600 text-gray-400'}`}>
                  3
                </div>
              </div>

              {/* Step 1: File Upload */}
              {csvImportStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-white font-medium mb-4">Step 1: Upload CSV File</h4>
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-gray-300 mb-4">Select a CSV file to upload</p>
                      <input
                        ref={csvFileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleCSVFileSelect}
                        className="hidden"
                      />
                      <button
                        onClick={() => csvFileInputRef.current?.click()}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        Choose CSV File
                      </button>
                    </div>
                    <div className="mt-4 text-sm text-gray-400">
                      <p className="mb-2">CSV Requirements:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>First row should contain column headers</li>
                        <li>Required columns: Name, Email</li>
                        <li>Optional columns: Phone, Company, Type, Status</li>
                        <li>Supported formats: .csv files only</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Column Mapping */}
              {csvImportStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-white font-medium mb-4">Step 2: Map CSV Columns</h4>
                    <p className="text-gray-300 mb-4">Match your CSV columns to contact fields:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { field: 'name', label: 'Name *', required: true },
                        { field: 'email', label: 'Email *', required: true },
                        { field: 'phone', label: 'Phone', required: false },
                        { field: 'company', label: 'Company', required: false },
                        { field: 'type', label: 'Type', required: false },
                        { field: 'status', label: 'Status', required: false }
                      ].map(({ field, label, required }) => (
                        <div key={field}>
                          <label className="block text-gray-300 text-sm font-medium mb-2">{label}</label>
                          <select
                            value={csvMapping[field] || ''}
                            onChange={(e) => handleMappingChange(field, e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="">-- Select CSV Column --</option>
                            {getCSVHeaders().map(header => (
                              <option key={header} value={header}>{header}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {csvPreview.length > 0 && (
                    <div>
                      <h5 className="text-white font-medium mb-2">Preview (First 5 rows):</h5>
                      <div className="overflow-x-auto bg-gray-700 rounded-lg">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-600">
                            <tr>
                              {getCSVHeaders().map(header => (
                                <th key={header} className="text-left p-2 text-gray-300">{header}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {csvPreview.map((row, index) => (
                              <tr key={index} className="border-t border-gray-600">
                                {getCSVHeaders().map(header => (
                                  <td key={header} className="p-2 text-gray-300">{row[header]}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <button
                      onClick={() => setCsvImportStep(1)}
                      className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setCsvImportStep(3)}
                      disabled={!csvMapping.name || !csvMapping.email}
                      className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Final Import */}
              {csvImportStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-white font-medium mb-4">Step 3: Import Contacts</h4>
                    <div className="bg-gray-700 rounded-lg p-4 mb-4">
                      <h5 className="text-white font-medium mb-2">Import Summary:</h5>
                      <div className="space-y-1 text-gray-300">
                        <p>CSV File: {csvFile?.name}</p>
                        <p>Mapped Fields:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          {Object.entries(csvMapping).map(([field, csvColumn]) => (
                            <li key={field}>{field}: {csvColumn}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4 mb-4">
                      <p className="text-yellow-300 text-sm">
                        ⚠️ This will add new contacts to your existing list. Duplicate contacts will not be automatically merged.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setCsvImportStep(2)}
                      className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleImportContacts}
                      disabled={isImporting}
                      className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      {isImporting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Importing...
                        </div>
                      ) : (
                        'Import Contacts'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
