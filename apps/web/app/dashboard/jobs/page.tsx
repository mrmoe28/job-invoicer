'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '../../../components/dashboard-layout';
import { trpc } from '../../../lib/trpc';
import type { JobPriority, JobStatus } from '../../../lib/types';

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterContact, setFilterContact] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [columnSettings, setColumnSettings] = useState([
    { id: 'title', label: 'Title', visible: true, order: 0 },
    { id: 'contact', label: 'Contact', visible: true, order: 1 },
    { id: 'status', label: 'Status', visible: true, order: 2 },
    { id: 'startDate', label: 'Start Date', visible: true, order: 3 },
    { id: 'priority', label: 'Priority', visible: false, order: 4 },
    { id: 'budget', label: 'Budget', visible: false, order: 5 },
    { id: 'address', label: 'Address', visible: false, order: 6 },
    { id: 'systemType', label: 'System Type', visible: false, order: 7 },
    { id: 'contactPhone', label: 'Contact Phone #', visible: false, order: 8 },
    { id: 'notes', label: 'Notes', visible: false, order: 9 },
    { id: 'tasks', label: 'Tasks', visible: false, order: 10 },
    { id: 'updates', label: 'Updates', visible: false, order: 11 },
    { id: 'image', label: 'Image', visible: false, order: 12 },
    { id: 'actions', label: 'Actions', visible: true, order: 13 }
  ]);
  const [viewJob, setViewJob] = useState<any>(null);
  const [editJob, setEditJob] = useState<any>(null);

  // tRPC queries and mutations
  const utils = trpc.useUtils();
  const { data: jobs = [], isLoading } = trpc.getJobs.useQuery({});
  const { data: companies = [] } = trpc.getCompanies.useQuery();

  const createJobMutation = trpc.createJob.useMutation({
    onSuccess: () => {
      // Invalidate and refetch jobs list and dashboard stats
      utils.getJobs.invalidate();
      utils.getDashboardStats.invalidate();
      setShowCreateModal(false);
      setEditJob(null);
    },
    onError: (error: any) => {
      console.error('Error creating job:', error);
      alert('Failed to create job. Please try again.');
    },
  });

  // Job management handlers
  const handleJobSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    console.log("Searching jobs:", e.target.value);
    // TODO: Implement job search/filter functionality
  }, []);

  const handleFilterContact = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterContact(e.target.value);
    console.log("Filtering by contact:", e.target.value);
    // TODO: Implement contact-based job filtering
  }, []);

  const handleJobViewChange = useCallback((mode: string) => {
    setViewMode(mode);
    console.log("Changing job view mode to:", mode);
    // TODO: Implement different view layouts (list/grid/kanban)
  }, []);

  const handleJobColumns = useCallback(() => {
    setShowColumnSettings(!showColumnSettings);
    console.log("Opening job column configuration");
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
        // Swap the orders
        const temp = columns[currentIndex].order;
        columns[currentIndex].order = columns[newIndex].order;
        columns[newIndex].order = temp;

        // Sort by order
        return columns.sort((a, b) => a.order - b.order);
      }
      return columns;
    });
  }, []);

  const getVisibleColumns = useCallback(() => {
    return columnSettings.filter(col => col.visible).sort((a, b) => a.order - b.order);
  }, [columnSettings]);

  const handleSaveJob = (jobData: any) => {
    if (!jobData.title?.trim()) {
      alert('Please enter a job title');
      return;
    }

    if (!companies.length) {
      alert('No companies available. Please create a company first.');
      return;
    }

    // Use the first available company as default
    const companyId = companies[0].id;

    createJobMutation.mutate({
      title: jobData.title,
      description: jobData.description || '',
      companyId: companyId,
      priority: jobData.priority || 'medium',
      assignedTo: jobData.assignedTo || '',
      dueDate: jobData.startDate?.toISOString() || new Date().toISOString(),
    });
  };

  const handleJobView = useCallback((jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    setViewJob(job || null);
  }, [jobs]);

  const handleJobEdit = useCallback((jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    setEditJob(job || null);
    setShowCreateModal(true);
  }, [jobs]);

  const handleJobDelete = useCallback((jobId: string) => {
    // TODO: Implement job deletion logic
    console.log('Deleting job:', jobId);
  }, []);

  const handleSelectJob = useCallback((jobId: string, checked: boolean) => {
    if (checked) {
      setSelectedJobs(prev => [...prev, jobId]);
    } else {
      setSelectedJobs(prev => prev.filter(id => id !== jobId));
    }
    console.log("Job selection changed:", jobId, checked);
  }, []);

  const handleSelectAllJobs = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedJobs(jobs.map(job => job.id));
    } else {
      setSelectedJobs([]);
    }
    console.log("Select all jobs:", checked);
  }, [jobs]);

  // Listen for job creation modal trigger from navigation
  useEffect(() => {
    const handleOpenJobModal = () => {
      setShowCreateModal(true);
    };

    window.addEventListener('openJobModal', handleOpenJobModal);
    return () => {
      window.removeEventListener('openJobModal', handleOpenJobModal);
    };
  }, []);

  const router = useRouter();

  return (
    <DashboardLayout title="Job Management">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center px-3 py-2 text-gray-400 hover:text-white transition-colors"
              title="Go back"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <button
              onClick={() => alert('Assign Crew Member modal coming soon!')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Assign Crew Member
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={handleJobSearch}
                className="w-64 pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <svg className="w-4 h-4 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              value={filterContact}
              onChange={handleFilterContact}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Filter by Contact</option>
            </select>
            <button
              onClick={handleJobColumns}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-gray-300 rounded-lg transition-colors"
              title="Column settings"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
              Columns
            </button>
          </div>
        </div>

        {/* Jobs Section */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Jobs</h3>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleJobViewChange('list')}
                  className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}
                  title="List view"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => handleJobViewChange('grid')}
                  className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}
                  title="Grid view"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleJobViewChange('kanban')}
                  className={`p-2 rounded transition-colors ${viewMode === 'kanban' ? 'bg-orange-500 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}
                  title="Kanban view"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Jobs Table */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="ml-3 text-gray-400">Loading jobs...</span>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No jobs found. Create your first job to get started!</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Create First Job
                </button>
              </div>
            ) : viewMode === 'list' && (
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left p-4 text-gray-300 font-medium">
                      <input
                        type="checkbox"
                        checked={selectedJobs.length === jobs.length}
                        onChange={(e) => handleSelectAllJobs(e.target.checked)}
                        className="rounded bg-gray-600 border-gray-500"
                        aria-label="Select all jobs"
                      />
                    </th>
                    {getVisibleColumns().filter(col => !['notes', 'updates', 'tasks', 'image'].includes(col.id)).map((column) => (
                      <th key={column.id} className={`text-left p-4 text-gray-300 font-medium ${column.id === 'actions' ? 'text-center' : ''}`}>
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} className="border-t border-gray-700 hover:bg-gray-700">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedJobs.includes(job.id)}
                          onChange={(e) => handleSelectJob(job.id, e.target.checked)}
                          className="rounded bg-gray-600 border-gray-500"
                        />
                      </td>
                      <td className="p-4 text-white font-medium">{job.title}</td>
                      <td className="p-4 text-gray-300">{(job as any).companyName || 'N/A'}</td>
                      <td className="p-4">
                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">{job.status}</span>
                      </td>
                      <td className="p-4 text-gray-300">
                        {job.dueDate ? new Date(job.dueDate).toLocaleDateString() : 'Not set'}
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleJobView(job.id)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="View job details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleJobEdit(job.id)}
                            className="text-gray-400 hover:text-gray-300 transition-colors"
                            title="Edit job"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleJobDelete(job.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Delete job"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {viewMode === 'grid' && (
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {jobs.map((job) => (
                  <div key={job.id} className="bg-gray-700 rounded-xl p-5 shadow flex flex-col justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-white mb-2">{job.title}</h4>
                      <div className="text-gray-300 text-sm mb-1">Assigned To: {job.assignedTo}</div>
                      <div className="text-gray-300 text-sm mb-1">Due: {new Date(job.dueDate).toDateString()}</div>
                      <div className="text-gray-300 text-sm mb-1">Priority: {job.priority}</div>
                      <div className="text-gray-300 text-sm mb-1">Status: {job.status}</div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">{job.status}</span>
                      <div className="flex space-x-2">
                        <button onClick={() => handleJobView(job.id)} className="text-blue-400 hover:text-blue-300" title="View job details">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button onClick={() => handleJobEdit(job.id)} className="text-gray-400 hover:text-gray-300" title="Edit job">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleJobDelete(job.id)} className="text-red-400 hover:text-red-300" title="Delete job">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {viewMode === 'kanban' && (
              <div className="p-6 overflow-x-auto">
                <div className="flex gap-6 min-w-[900px]">
                  {['To Do', 'In Progress', 'Completed'].map((status) => (
                    <div key={status} className="flex-1 min-w-[280px] bg-gray-700 rounded-xl p-4">
                      <h4 className="text-lg font-bold text-white mb-4">{status}</h4>
                      {jobs.filter((job) => job.status === status).length === 0 && (
                        <div className="text-gray-400 text-sm">No jobs</div>
                      )}
                      {jobs.filter((job) => job.status === status).map((job) => (
                        <div key={job.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 shadow-md hover:shadow-lg transition-all duration-200 flex flex-col justify-between">
                          <div>
                            <div className="text-white font-semibold mb-1">{job.title}</div>
                            <div className="text-gray-300 text-xs mb-1">Assigned To: {job.assignedTo}</div>
                            <div className="text-gray-300 text-xs mb-1">Due: {new Date(job.dueDate).toDateString()}</div>
                            <div className="text-gray-300 text-xs mb-1">Priority: {job.priority}</div>
                            <div className="text-gray-300 text-xs mb-1">Status: {job.status}</div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex space-x-2">
                              <button onClick={() => handleJobView(job.id)} className="text-blue-400 hover:text-blue-300" title="View job details">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              </button>
                              <button onClick={() => handleJobEdit(job.id)} className="text-gray-400 hover:text-gray-300" title="Edit job">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              <button onClick={() => handleJobDelete(job.id)} className="text-red-400 hover:text-red-300" title="Delete job">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Column Settings Panel */}
        {showColumnSettings && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Customize Columns</h3>
            <div className="space-y-3">
              {columnSettings.map((column) => (
                <div key={column.id} className="flex items-center justify-between">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={column.visible}
                      onChange={() => handleColumnToggle(column.id)}
                      className="rounded bg-gray-600 border-gray-500 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-gray-300">{column.label}</span>
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleColumnReorder(column.id, 'up')}
                      disabled={column.order === 0}
                      className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title={`Move ${column.label} up`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleColumnReorder(column.id, 'down')}
                      disabled={column.order === columnSettings.length - 1}
                      className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title={`Move ${column.label} down`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowColumnSettings(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowColumnSettings(false)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Create Job Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Create New Job</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Job Title</label>
                  <input
                    type="text"
                    placeholder="Enter job title"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Contact</label>
                  <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500">
                    <option value="">Select contact...</option>
                    <option value="john">John Smith</option>
                    <option value="sarah">Sarah Johnson</option>
                    <option value="mike">Mike Rodriguez</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500">
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                  <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Budget</label>
                  <input
                    type="text"
                    placeholder="$0.00"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Job description..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const form = document.querySelector('.bg-gray-800.border.border-gray-700.rounded-xl.p-6.w-full.max-w-md.mx-4');
                    if (!form) return;
                    const title = (form.querySelector('input[placeholder="Enter job title"]') as HTMLInputElement)?.value;
                    const contactId = (form.querySelector('select') as HTMLSelectElement)?.value;
                    const statusValue = (form.querySelectorAll('select')[1] as HTMLSelectElement)?.value;
                    const startDateStr = (form.querySelector('input[type="date"]') as HTMLInputElement)?.value;
                    const priorityValue = (form.querySelectorAll('select')[2] as HTMLSelectElement)?.value;
                    const budgetStr = (form.querySelector('input[placeholder="$0.00"]') as HTMLInputElement)?.value;
                    const description = (form.querySelector('textarea') as HTMLTextAreaElement)?.value;
                    const startDate = startDateStr ? new Date(startDateStr) : new Date();
                    const budget = budgetStr ? parseFloat(budgetStr.replace(/[^\d.]/g, '')) : 0;
                    // Validate status and priority
                    const validStatuses = ['quoted', 'scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold'] as const;
                    const validPriorities: JobPriority[] = ['low', 'medium', 'high', 'urgent'];
                    const status = validStatuses.includes(statusValue as JobStatus) ? statusValue as JobStatus : 'quoted';
                    const priority = validPriorities.includes(priorityValue as JobPriority) ? priorityValue as JobPriority : 'medium';
                    if (editJob) {
                      // TODO: Implement job update mutation
                      console.log('Update job:', { editJob, title, contactId, status, startDate, priority, budget, description });
                      setEditJob(null);
                      setShowCreateModal(false);
                    } else {
                      handleSaveJob({
                        id: `${title?.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
                        title,
                        contactId,
                        status,
                        startDate,
                        priority,
                        budget,
                        description,
                        address: '',
                        systemType: '',
                        contactPhone: '',
                        notes: '',
                        tasks: [],
                        updates: '',
                        image: '',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                      });
                    }
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {editJob ? 'Save Changes' : 'Create Job'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Job Modal */}
        {viewJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Job Details</h3>
                <button
                  onClick={() => setViewJob(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-2">
                <div><span className="font-medium text-gray-300">Title:</span> <span className="text-white">{viewJob.title}</span></div>
                <div><span className="font-medium text-gray-300">Contact:</span> <span className="text-white">{viewJob.contactId}</span></div>
                <div><span className="font-medium text-gray-300">Status:</span> <span className="text-white">{viewJob.status}</span></div>
                <div><span className="font-medium text-gray-300">Start Date:</span> <span className="text-white">{viewJob.startDate.toDateString()}</span></div>
                <div><span className="font-medium text-gray-300">Priority:</span> <span className="text-white">{viewJob.priority}</span></div>
                <div><span className="font-medium text-gray-300">Budget:</span> <span className="text-white">{viewJob.budget}</span></div>
                <div><span className="font-medium text-gray-300">Description:</span> <span className="text-white">{viewJob.description}</span></div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setViewJob(null)}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Click outside to close column settings */}
        {showColumnSettings && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => setShowColumnSettings(false)}
          ></div>
        )}
      </div>
    </DashboardLayout>
  );
}
