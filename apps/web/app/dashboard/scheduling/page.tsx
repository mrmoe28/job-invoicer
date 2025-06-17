'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '../../../components/dashboard-layout';

type Schedule = {
  date: string;
  employee: string;
  job: string;
  startTime: string;
  endTime: string;
};

function SchedulingContent() {
  const searchParams = useSearchParams();
  const [currentDate, setCurrentDate] = useState(new Date(2025, 5, 14)); // June 14, 2025
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);

  // Schedules state and persistence
  const [schedules, setSchedules] = useState<Schedule[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('schedules');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('schedules', JSON.stringify(schedules));
    }
  }, [schedules]);

  // Handle date parameter from dashboard navigation
  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      const paramDate = new Date(dateParam);
      if (!isNaN(paramDate.getTime())) {
        setCurrentDate(paramDate);
        setSelectedDate(paramDate);
      }
    }
  }, [searchParams]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const days = getDaysInMonth(currentDate);

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    console.log(`Selected date: ${clickedDate.toDateString()}`);
  };

  const handleAddSchedule = () => {
    setShowAddScheduleModal(true);
    console.log('Opening Add Schedule modal...');
  };

  const handleCreateFirstSchedule = () => {
    setShowAddScheduleModal(true);
    console.log('Creating first schedule...');
  };

  const getFormattedDate = (date: Date | null) => {
    if (!date) return 'No date selected';
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      currentDate.getFullYear() === today.getFullYear() &&
      currentDate.getMonth() === today.getMonth() &&
      day === today.getDate()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getFullYear() === currentDate.getFullYear() &&
      selectedDate.getMonth() === currentDate.getMonth() &&
      selectedDate.getDate() === day
    );
  };

  // Add Schedule Modal state
  const [scheduleForm, setScheduleForm] = useState({
    date: '',
    employee: '',
    job: '',
    startTime: '09:00',
    endTime: '17:00',
  });

  return (
    <DashboardLayout title="Employee Scheduling">
      <div className="space-y-6">
        {/* Add Schedule Button */}
        <div className="flex justify-end">
          <button 
            onClick={handleAddSchedule}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Schedule
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Calendar</h3>
              <p className="text-gray-400 text-sm">Select a date to view schedules</p>
            </div>

            {/* Calendar Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={() => navigateMonth(-1)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <h4 className="text-lg font-semibold text-white">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h4>
              
              <button 
                onClick={() => navigateMonth(1)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-gray-400 text-sm font-medium py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => (
                <button
                  key={index}
                  onClick={day ? () => handleDateClick(day) : undefined}
                  disabled={day === null}
                  className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-colors ${
                    day === null
                      ? 'cursor-default'
                      : isSelected(day)
                      ? 'bg-blue-600 text-white font-semibold'
                      : isToday(day)
                      ? 'bg-orange-500 text-white font-semibold'
                      : 'text-gray-300 hover:bg-gray-700 cursor-pointer'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Add remaining days to fill the grid */}
            {days.length < 42 && (
              <div className="grid grid-cols-7 gap-1 mt-1">
                {Array.from({ length: 42 - days.length }, (_, i) => (
                  <div
                    key={`next-${i + 1}`}
                    className="aspect-square flex items-center justify-center text-sm text-gray-500 cursor-pointer rounded-lg hover:bg-gray-700"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Schedule Details */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Schedules for {getFormattedDate(selectedDate)}
              </h3>
              <p className="text-gray-400 text-sm">
                {selectedDate ? '0 schedules found' : 'Select a date to view schedules'}
              </p>
            </div>

            {selectedDate ? (
              schedules.filter((s: Schedule) => s.date === selectedDate.toISOString().split('T')[0]).length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-white mb-2">No schedules available</h4>
                  <p className="text-gray-400 mb-6">
                    No schedules found for {selectedDate.toLocaleDateString()}. Click the button below 
                    to create a schedule for this date.
                  </p>
                  <button 
                    onClick={handleCreateFirstSchedule}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Schedule for This Date
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {schedules.filter((s: Schedule) => s.date === selectedDate.toISOString().split('T')[0]).map((s, i: number) => (
                    <div key={i} className="bg-gray-700 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-white font-medium">{s.job}</div>
                        <div className="text-gray-400 text-sm">{s.employee} • {s.startTime} - {s.endTime}</div>
                      </div>
                      <div className="text-gray-400 text-sm mt-2 md:mt-0">{s.date}</div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-white mb-2">Select a date</h4>
                <p className="text-gray-400 mb-6">
                  Click on any date in the calendar to view or create schedules for that day.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Add Schedule Modal */}
        {showAddScheduleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-white mb-4">Create New Schedule</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                  <input
                    type="date"
                    value={scheduleForm.date || selectedDate?.toISOString().split('T')[0] || ''}
                    onChange={e => setScheduleForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Employee/Team</label>
                  <select
                    value={scheduleForm.employee}
                    onChange={e => setScheduleForm(f => ({ ...f, employee: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">Select employee...</option>
                    <option value="john">John Smith</option>
                    <option value="sarah">Sarah Johnson</option>
                    <option value="team-a">Team A</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Job/Task</label>
                  <input
                    type="text"
                    placeholder="Enter job or task description"
                    value={scheduleForm.job}
                    onChange={e => setScheduleForm(f => ({ ...f, job: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                    <input
                      type="time"
                      value={scheduleForm.startTime}
                      onChange={e => setScheduleForm(f => ({ ...f, startTime: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
                    <input
                      type="time"
                      value={scheduleForm.endTime}
                      onChange={e => setScheduleForm(f => ({ ...f, endTime: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddScheduleModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!scheduleForm.date || !scheduleForm.employee || !scheduleForm.job) return;
                    setSchedules((prev: Schedule[]) => [...prev, { ...scheduleForm }]);
                    setShowAddScheduleModal(false);
                    setScheduleForm({ date: '', employee: '', job: '', startTime: '09:00', endTime: '17:00' });
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Create Schedule
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function SchedulingPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </DashboardLayout>
    }>
      <SchedulingContent />
    </Suspense>
  );
}
