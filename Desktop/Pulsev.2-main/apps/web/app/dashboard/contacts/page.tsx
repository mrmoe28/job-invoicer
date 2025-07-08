'use client';

import { useState, useCallback, useEffect } from 'react';
import { DashboardLayout } from '@/components/core/layouts/DashboardLayout';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  tags: string[];
  leadSource: string;
  status: string;
  dateAdded: string;
  lastContact: string;
  notes: string;
}

interface ColumnSetting {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [editingCell, setEditingCell] = useState<{contactId: string, field: string} | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [viewContact, setViewContact] = useState<Contact | null>(null);
  const [tagInput, setTagInput] = useState('');
  
  const [addForm, setAddForm] = useState<Partial<Contact>>({
    firstName: '', 
    lastName: '', 
    companyName: '', 
    email: '', 
    phone: '', 
    mobile: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    tags: [],
    leadSource: '',
    status: 'Active',
    notes: '',
  });

  const [columnSettings, setColumnSettings] = useState<ColumnSetting[]>([
    { id: 'name', label: 'Name', visible: true, order: 0 },
    { id: 'companyName', label: 'Company', visible: true, order: 1 },
    { id: 'email', label: 'Email', visible: true, order: 2 },
    { id: 'phone', label: 'Phone', visible: true, order: 3 },
    { id: 'tags', label: 'Tags', visible: true, order: 4 },
    { id: 'leadSource', label: 'Lead Source', visible: true, order: 5 },
    { id: 'status', label: 'Status', visible: true, order: 6 },
    { id: 'lastContact', label: 'Last Contact', visible: true, order: 7 },
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
    setAddForm({
      firstName: '', 
      lastName: '', 
      companyName: '', 
      email: '', 
      phone: '', 
      mobile: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      tags: [],
      leadSource: '',
      status: 'Active',
      notes: '',
    });
    setShowAddModal(true);
  }, []);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
  }, []);

  const handleViewChange = useCallback((mode: string) => {
    setViewMode(mode);
  }, [viewMode]);

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

  const getVisibleColumns = useCallback(() => {
    return columnSettings.filter(col => col.visible).sort((a, b) => a.order - b.order);
  }, [columnSettings]);

  const handleViewContact = useCallback((contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    setViewContact(contact || null);
  }, [contacts]);

  const handleEditContact = useCallback((contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      setAddForm(contact);
      setEditContact(contact);
      setShowAddModal(true);
    }
  }, [contacts]);

  const handleDeleteContact = useCallback((contactId: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      setContacts(prev => prev.filter(contact => contact.id !== contactId));
      setSelectedContacts(prev => prev.filter(id => id !== contactId));
    }
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
      setSelectedContacts(filteredContacts.map(contact => contact.id));
    } else {
      setSelectedContacts([]);
    }
  }, [contacts]);

  const handleSaveContact = () => {
    if (!addForm.firstName?.trim() || !addForm.lastName?.trim() || !addForm.email?.trim()) return;
    
    if (editContact) {
      setContacts(prev => prev.map(c => c.id === editContact.id ? { ...c, ...addForm } as Contact : c));
      setEditContact(null);
    } else {
      const newContact: Contact = {
        ...addForm as Contact,
        id: `contact-${Date.now()}`,
        dateAdded: new Date().toISOString(),
        lastContact: new Date().toISOString(),
      };
      setContacts(prev => [...prev, newContact]);
    }
    setShowAddModal(false);
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = searchQuery === '' || 
      contact.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === '' || contact.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const bulkDeleteSelected = () => {
    if (selectedContacts.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedContacts.length} selected contacts?`)) {
      setContacts(prev => prev.filter(contact => !selectedContacts.includes(contact.id)));
      setSelectedContacts([]);
    }
  };

  const bulkChangeStatus = (newStatus: string) => {
    if (selectedContacts.length === 0) return;
    
    setContacts(prev => prev.map(contact => 
      selectedContacts.includes(contact.id) 
        ? { ...contact, status: newStatus } 
        : contact
    ));
  };

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Contact
            </button>
            
            {selectedContacts.length > 0 && (
              <div className="flex space-x-2">
                <button 
                  onClick={bulkDeleteSelected}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Delete Selected
                </button>
                <div className="relative group">
                  <button 
                    className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Change Status
                    <svg className="w-4 h-4 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute z-10 left-0 mt-2 w-48 rounded-lg shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5 hidden group-hover:block">
                    <div className="py-1">
                      <button
                        onClick={() => bulkChangeStatus('Active')}
                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600"
                      >
                        Active
                      </button>
                      <button
                        onClick={() => bulkChangeStatus('Lead')}
                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600"
                      >
                        Lead
                      </button>
                      <button
                        onClick={() => bulkChangeStatus('Customer')}
                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600"
                      >
                        Customer
                      </button>
                      <button
                        onClick={() => bulkChangeStatus('Inactive')}
                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600"
                      >
                        Inactive
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
              value={filterStatus}
              onChange={handleFilterChange}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Lead">Lead</option>
              <option value="Customer">Customer</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
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
                
                <button 
                  onClick={handleColumnSettings}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-gray-300 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Columns
                </button>
              </div>
            </div>
          </div>

          {showColumnSettings && (
            <div className="px-6 py-4 border-b border-gray-700 bg-gray-750">
              <h4 className="text-white font-medium mb-4">Column Settings</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {columnSettings.filter(col => col.id !== 'actions').map((column) => (
                  <div key={column.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`col-${column.id}`}
                      checked={column.visible}
                      onChange={() => handleColumnToggle(column.id)}
                      className="rounded bg-gray-600 border-gray-500"
                    />
                    <label htmlFor={`col-${column.id}`} className="text-gray-300">
                      {column.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showFilters && (
            <div className="px-6 py-4 border-b border-gray-700 bg-gray-750">
              <h4 className="text-white font-medium mb-4">Advanced Filters</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Lead Source</label>
                  <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
                    <option value="">All Sources</option>
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Cold Call">Cold Call</option>
                    <option value="Event">Event</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Date Added</label>
                  <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
                    <option value="">Any Time</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Last Contact</label>
                  <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
                    <option value="">Any Time</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                    <option value="never">Never</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            {viewMode === 'list' && (
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left p-4 text-gray-300 font-medium">
                      <input 
                        type="checkbox" 
                        checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded bg-gray-600 border-gray-500"
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
                  {filteredContacts.length === 0 ? (
                    <tr>
                      <td colSpan={getVisibleColumns().length + 1} className="p-4 text-center text-gray-400">
                        No contacts found. Add a new contact to get started.
                      </td>
                    </tr>
                  ) : (
                    filteredContacts.map((contact) => {
                      const renderColumnContent = (columnId: string) => {
                        switch (columnId) {
                          case 'name':
                            return <span className="text-white font-medium">{contact.firstName} {contact.lastName}</span>;
                          case 'companyName':
                            return <span className="text-gray-300">{contact.companyName || '-'}</span>;
                          case 'email':
                            return <span className="text-gray-300">{contact.email}</span>;
                          case 'phone':
                            return <span className="text-gray-300">{contact.phone}</span>;
                          case 'tags':
                            return (
                              <div className="flex flex-wrap gap-1">
                                {contact.tags && contact.tags.slice(0, 2).map((tag, idx) => (
                                  <span key={idx} className="bg-gray-600 text-white px-2 py-1 rounded text-xs">
                                    {tag}
                                  </span>
                                ))}
                                {contact.tags && contact.tags.length > 2 && (
                                  <span className="text-gray-400 text-xs">+{contact.tags.length - 2}</span>
                                )}
                              </div>
                            );
                          case 'leadSource':
                            return <span className="text-gray-300">{contact.leadSource || '-'}</span>;
                          case 'status':
                            return (
                              <span className={`px-2 py-1 rounded text-sm ${
                                contact.status === 'Active' ? 'bg-green-600 text-white' : 
                                contact.status === 'Lead' ? 'bg-blue-600 text-white' :
                                contact.status === 'Customer' ? 'bg-purple-600 text-white' :
                                'bg-gray-600 text-white'
                              }`}>
                                {contact.status}
                              </span>
                            );
                          case 'lastContact':
                            return <span className="text-gray-300">
                              {contact.lastContact ? new Date(contact.lastContact).toLocaleDateString() : '-'}
                            </span>;
                          case 'actions':
                            return (
                              <div className="flex justify-center space-x-2">
                                <button 
                                  onClick={() => handleViewContact(contact.id)}
                                  className="text-blue-400 hover:text-blue-300"
                                  title="View details"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>
                                <button 
                                  onClick={() => handleEditContact(contact.id)}
                                  className="text-gray-400 hover:text-gray-300"
                                  title="Edit"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button 
                                  onClick={() => handleDeleteContact(contact.id)}
                                  className="text-red-400 hover:text-red-300"
                                  title="Delete"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
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
                            />
                          </td>
                          {getVisibleColumns().map((column) => (
                            <td key={column.id} className={`p-4 ${column.id === 'actions' ? 'text-center' : ''}`}>
                              {renderColumnContent(column.id)}
                            </td>
                          ))}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}

            {viewMode === 'grid' && (
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredContacts.length === 0 ? (
                  <div className="col-span-full text-center text-gray-400">
                    No contacts found. Add a new contact to get started.
                  </div>
                ) : (
                  filteredContacts.map((contact) => (
                    <div key={contact.id} className="bg-gray-700 rounded-xl p-5 shadow">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-lg font-bold text-white">{contact.firstName} {contact.lastName}</h4>
                        <span className={`px-2 py-1 rounded text-xs ${
                          contact.status === 'Active' ? 'bg-green-600' : 
                          contact.status === 'Lead' ? 'bg-blue-600' :
                          contact.status === 'Customer' ? 'bg-purple-600' :
                          'bg-gray-600'
                        } text-white`}>
                          {contact.status}
                        </span>
                      </div>
                      {contact.companyName && (
                        <div className="text-gray-300 text-sm mb-2">{contact.companyName}</div>
                      )}
                      <div className="text-gray-400 text-sm space-y-1 mb-3">
                        <div>{contact.email}</div>
                        <div>{contact.phone}</div>
                        {contact.leadSource && <div>Source: {contact.leadSource}</div>}
                      </div>
                      {contact.tags && contact.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {contact.tags.map((tag, idx) => (
                            <span key={idx} className="bg-gray-600 text-white px-2 py-1 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-end space-x-2 mt-2">
                        <input 
                          type="checkbox" 
                          checked={selectedContacts.includes(contact.id)}
                          onChange={(e) => handleSelectContact(contact.id, e.target.checked)}
                          className="rounded bg-gray-600 border-gray-500"
                        />
                        <button onClick={() => handleViewContact(contact.id)} className="text-blue-400 hover:text-blue-300">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button onClick={() => handleEditContact(contact.id)} className="text-gray-400 hover:text-gray-300">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDeleteContact(contact.id)} className="text-red-400 hover:text-red-300">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                {editContact ? 'Edit Contact' : 'Add Contact'}
              </h3>
              <button
                onClick={() => { setShowAddModal(false); setEditContact(null); }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="text-white font-medium">Personal Information</h4>
                <input 
                  type="text" 
                  placeholder="First Name *" 
                  value={addForm.firstName || ''} 
                  onChange={e => setAddForm(form => ({ ...form, firstName: e.target.value }))} 
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400" 
                />
                <input 
                  type="text" 
                  placeholder="Last Name *" 
                  value={addForm.lastName || ''} 
                  onChange={e => setAddForm(form => ({ ...form, lastName: e.target.value }))} 
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400" 
                />
                <input 
                  type="email" 
                  placeholder="Email *" 
                  value={addForm.email || ''} 
                  onChange={e => setAddForm(form => ({ ...form, email: e.target.value }))} 
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400" 
                />
                <input 
                  type="text" 
                  placeholder="Phone" 
                  value={addForm.phone || ''} 
                  onChange={e => setAddForm(form => ({ ...form, phone: e.target.value }))} 
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400" 
                />
                <input 
                  type="text" 
                  placeholder="Mobile" 
                  value={addForm.mobile || ''} 
                  onChange={e => setAddForm(form => ({ ...form, mobile: e.target.value }))} 
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400" 
                />
              </div>

              {/* Company Information */}
              <div className="space-y-4">
                <h4 className="text-white font-medium">Company Information</h4>
                <input 
                  type="text" 
                  placeholder="Company Name" 
                  value={addForm.companyName || ''} 
                  onChange={e => setAddForm(form => ({ ...form, companyName: e.target.value }))} 
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400" 
                />
                <select 
                  value={addForm.leadSource || ''} 
                  onChange={e => setAddForm(form => ({ ...form, leadSource: e.target.value }))} 
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">Select Lead Source</option>
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Cold Call">Cold Call</option>
                  <option value="Event">Event</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Other">Other</option>
                </select>
                <select 
                  value={addForm.status || 'Active'} 
                  onChange={e => setAddForm(form => ({ ...form, status: e.target.value }))} 
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="Active">Active</option>
                  <option value="Lead">Lead</option>
                  <option value="Customer">Customer</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h4 className="text-white font-medium">Address</h4>
                <input 
                  type="text" 
                  placeholder="Street Address" 
                  value={addForm.address || ''} 
                  onChange={e => setAddForm(form => ({ ...form, address: e.target.value }))} 
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400" 
                />
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="City" 
                    value={addForm.city || ''} 
                    onChange={e => setAddForm(form => ({ ...form, city: e.target.value }))} 
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400" 
                  />
                  <input 
                    type="text" 
                    placeholder="State" 
                    value={addForm.state || ''} 
                    onChange={e => setAddForm(form => ({ ...form, state: e.target.value }))} 
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400" 
                  />
                </div>
                <input 
                  type="text" 
                  placeholder="ZIP Code" 
                  value={addForm.zipCode || ''} 
                  onChange={e => setAddForm(form => ({ ...form, zipCode: e.target.value }))} 
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400" 
                />
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h4 className="text-white font-medium">Additional Information</h4>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Tags</label>
                  <div className="flex space-x-2 mb-2">
                    <input 
                      type="text" 
                      placeholder="Add tag" 
                      value={tagInput} 
                      onChange={(e) => setTagInput(e.target.value)} 
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400" 
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (tagInput.trim()) {
                          setAddForm(form => ({
                            ...form,
                            tags: [...(form.tags || []), tagInput.trim()]
                          }));
                          setTagInput('');
                        }
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(addForm.tags || []).map((tag, index) => (
                      <div key={index} className="bg-gray-600 rounded-lg px-2 py-1 flex items-center space-x-1">
                        <span className="text-white text-sm">{tag}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setAddForm(form => ({
                              ...form,
                              tags: (form.tags || []).filter((_, i) => i !== index)
                            }));
                          }}
                          className="text-gray-400 hover:text-white"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Notes</label>
                  <textarea
                    placeholder="Add notes about this contact"
                    value={addForm.notes || ''}
                    onChange={e => setAddForm(form => ({ ...form, notes: e.target.value }))}
                    rows={4}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <button 
                onClick={() => { setShowAddModal(false); setEditContact(null); }} 
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveContact} 
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {editContact ? 'Save Changes' : 'Add Contact'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Contact Modal */}
      {viewContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Contact Details</h3>
              <button
                onClick={() => setViewContact(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-medium mb-3">Personal Information</h4>
                <div className="space-y-2 text-gray-300">
                  <div><span className="font-medium">Name:</span> {viewContact.firstName} {viewContact.lastName}</div>
                  <div><span className="font-medium">Email:</span> {viewContact.email}</div>
                  <div><span className="font-medium">Phone:</span> {viewContact.phone}</div>
                  <div><span className="font-medium">Mobile:</span> {viewContact.mobile || '-'}</div>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-3">Company Information</h4>
                <div className="space-y-2 text-gray-300">
                  <div><span className="font-medium">Company:</span> {viewContact.companyName || '-'}</div>
                  <div><span className="font-medium">Lead Source:</span> {viewContact.leadSource || '-'}</div>
                  <div><span className="font-medium">Status:</span> <span className={`px-2 py-1 rounded text-xs ${
                    viewContact.status === 'Active' ? 'bg-green-600' : 
                    viewContact.status === 'Lead' ? 'bg-blue-600' :
                    viewContact.status === 'Customer' ? 'bg-purple-600' :
                    'bg-gray-600'
                  } text-white`}>{viewContact.status}</span></div>
                  <div><span className="font-medium">Date Added:</span> {viewContact.dateAdded ? new Date(viewContact.dateAdded).toLocaleDateString() : '-'}</div>
                  <div><span className="font-medium">Last Contact:</span> {viewContact.lastContact ? new Date(viewContact.lastContact).toLocaleDateString() : '-'}</div>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-3">Address</h4>
                <div className="space-y-2 text-gray-300">
                  <div>{viewContact.address || '-'}</div>
                  <div>{viewContact.city && viewContact.state ? `${viewContact.city}, ${viewContact.state} ${viewContact.zipCode}` : '-'}</div>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {viewContact.tags && viewContact.tags.length > 0 ? (
                    viewContact.tags.map((tag, idx) => (
                      <span key={idx} className="bg-gray-600 text-white px-2 py-1 rounded text-xs">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">No tags</span>
                  )}
                </div>
              </div>
              
              <div className="col-span-1 md:col-span-2">
                <h4 className="text-white font-medium mb-3">Notes</h4>
                <div className="bg-gray-700 p-4 rounded-lg text-gray-300">
                  {viewContact.notes || 'No notes available.'}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button 
                onClick={() => handleEditContact(viewContact.id)} 
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Edit Contact
              </button>
              <button 
                onClick={() => setViewContact(null)} 
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}