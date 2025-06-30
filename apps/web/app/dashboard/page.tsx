'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../components/dashboard-layout';
import { JobStatusBadge, PriorityBadge } from '../../components/status-badge';
import { trpc } from '../../lib/trpc';
import { DashboardMetrics, Job } from '../../lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const [selectedTimeframe, setSelectedTimeframe] = useState('Monthly');
  const hello = trpc.hello.useQuery({ name: 'Team' });
  const users = trpc.getUsers.useQuery();
  const dashboardStats = trpc.getDashboardStats.useQuery();
  const recentJobs = trpc.getJobs.useQuery({});

  // Navigation handlers
  const handleAddContact = () => {
    router.push('/dashboard/contacts');
  };

  const handleCreateJob = () => {
    router.push('/dashboard/jobs');
  };

  const handleCalendarClick = () => {
    router.push('/dashboard/scheduling');
  };

  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
    // Here you could trigger a data refresh or analytics update
    console.log(`Analytics timeframe changed to: ${timeframe}`);
  };

  const handleDateClick = (day: number) => {
    console.log(`Selected date: June ${day}, 2025`);
    // Here you could open a modal to view/schedule jobs for this date
    // or navigate to the scheduling page with this date pre-selected
    router.push(`/dashboard/scheduling?date=2025-06-${day.toString().padStart(2, '0')}`);
  };

  // Use real data from the database
  const metrics = dashboardStats.data ? {
    totalContacts: dashboardStats.data.totalContacts,
    activeJobs: dashboardStats.data.activeJobs,
    completedJobsThisMonth: dashboardStats.data.completedJobs,
    totalRevenue: 0, // Will be calculated from actual invoices when implemented
    averageJobValue: 0, // Will be calculated from actual job budgets
    conversionRate: dashboardStats.data.totalJobs > 0 ? dashboardStats.data.completedJobs / dashboardStats.data.totalJobs : 0,
    completionRate: dashboardStats.data.completionRate,
    crewUtilization: 0 // Will be calculated from actual time entries
  } : {
    totalContacts: 0,
    activeJobs: 0,
    completedJobsThisMonth: 0,
    totalRevenue: 0,
    averageJobValue: 0,
    conversionRate: 0,
    completionRate: 0,
    crewUtilization: 0
  };

  // Use real jobs data from the database
  const jobsData = recentJobs.data || [];

  const dashboardCards = [
    {
      title: 'Total Contacts',
      value: metrics.totalContacts.toString(),
      subtitle: 'Active contacts',
      change: '+3 this week',
      changeType: 'positive' as 'positive' | 'negative' | 'neutral',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      title: 'Active Jobs',
      value: metrics.activeJobs.toString(),
      subtitle: 'In progress',
      change: '+2 this month',
      changeType: 'positive' as 'positive' | 'negative' | 'neutral',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
        </svg>
      )
    },
    {
      title: 'Revenue',
      value: `$${(metrics.totalRevenue / 1000).toFixed(0)}k`,
      subtitle: 'This month',
      change: `$${metrics.averageJobValue.toLocaleString()} avg`,
      changeType: 'neutral' as 'positive' | 'negative' | 'neutral',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    },
    {
      title: 'Completion Rate',
      value: `${Math.round(metrics.completionRate * 100)}%`,
      subtitle: 'On-time delivery',
      change: `${Math.round(metrics.conversionRate * 100)}% conversion`,
      changeType: 'positive' as 'positive' | 'negative' | 'neutral',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <DashboardLayout 
      title="Dashboard" 
      subtitle="Overview of your business operations and performance"
    >
      <div className="space-y-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardCards.map((metric, index) => (
            <div key={index} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                  {metric.icon}
                </div>
                <span className={`text-sm font-medium ${
                  metric.changeType === 'positive' ? 'text-green-400' : 
                  metric.changeType === 'negative' ? 'text-red-400' : 
                  'text-gray-400'
                }`}>
                  {metric.change}
                </span>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">{metric.title}</p>
                <p className="text-3xl font-bold text-white mb-1">{metric.value}</p>
                <p className="text-gray-500 text-sm">{metric.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Welcome Card */}
          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-3">Welcome to your CRM Dashboard</h3>
            <p className="text-gray-400 mb-4">
              Your personalized hub for managing client relationships, tracking jobs, and 
              monitoring your team&apos;s performance—all in one place.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={handleAddContact}
                className="btn-primary"
              >
                Add Contact
              </button>
              <button 
                onClick={handleCreateJob}
                className="btn-secondary"
              >
                Create Job
              </button>
            </div>
          </div>

          {/* Calendar Widget */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Calendar</h3>
              <button 
                onClick={handleCalendarClick}
                className="text-blue-400 hover:text-blue-300 transition-colors"
                title="Open full calendar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <p className="text-gray-400 text-sm mb-4">Select a date to view or schedule jobs</p>
            
            {/* Mini Calendar */}
            <div className="space-y-2">
              <div className="text-center text-white font-semibold">June 2025</div>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-gray-400 text-center p-1">{day}</div>
                ))}
                {Array.from({length: 30}, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handleDateClick(i + 1)}
                    className={`text-center p-1 rounded transition-colors cursor-pointer ${
                      i === 13 
                        ? 'bg-orange-500 text-white' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Recent Jobs</h3>
              <button 
                onClick={handleCreateJob}
                className="btn-primary text-sm"
              >
                View All Jobs
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {jobsData.length > 0 ? jobsData.map((job) => (
              <div key={job.id} className="bg-gray-750 border border-gray-650 rounded-lg p-4 hover:bg-gray-700 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="text-white font-medium mb-1">{job.title}</h4>
                    <p className="text-gray-400 text-sm mb-2">{job.location || 'No location specified'}</p>
                    <div className="flex items-center space-x-3 text-sm text-gray-300">
                      {job.estimatedStartDate && (
                        <span>Start: {new Date(job.estimatedStartDate).toLocaleDateString()}</span>
                      )}
                      {job.estimatedBudget && <span>Budget: ${parseFloat(job.estimatedBudget).toLocaleString()}</span>}
                      <span>Company: {job.companyName}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <PriorityBadge priority={job.priority} size="sm" />
                    <JobStatusBadge status={job.status} size="sm" />
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No jobs found. Create your first job to get started!</p>
              </div>
            )}
          </div>
        </div>

        {/* Performance Analytics */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Performance Analytics</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleTimeframeChange('Weekly')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectedTimeframe === 'Weekly' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  Weekly
                </button>
                <button 
                  onClick={() => handleTimeframeChange('Monthly')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectedTimeframe === 'Monthly' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  Monthly
                </button>
                <button 
                  onClick={() => handleTimeframeChange('Yearly')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectedTimeframe === 'Yearly' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>
          </div>
          
          <p className="text-gray-400 text-sm mb-4">Track your business performance over time</p>
          
          {/* Chart Placeholder */}
          <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p>Performance chart will appear here</p>
            </div>
          </div>
        </div>

        {/* API Status */}
        {(hello.data || users.data) && (
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">API Connection: </span>
                <span className="text-green-400 font-medium">
                  {hello.data || 'Connected'}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">Active Users: </span>
                <span className="text-green-400 font-medium">
                  {users.data?.length || 0} online
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
