'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/dashboard-layout';
import { trpc } from '@/lib/trpc';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'Administrator'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  // Load user data from localStorage on component mount
  useEffect(() => {
    const userData = localStorage.getItem('pulse_user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setProfile({
          firstName: user.name?.split(' ')[0] || '',
          lastName: user.name?.split(' ')[1] || '',
          email: user.email || '',
          phone: '', // Phone not stored in session, would need API call
          role: user.role || 'Administrator'
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    // Clear messages when user starts typing
    if (successMessage) setSuccessMessage('');
    if (error) setError('');
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Simulate API call for now
      // TODO: Implement actual user update API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update localStorage with new name
      const userData = localStorage.getItem('pulse_user');
      if (userData) {
        const user = JSON.parse(userData);
        user.name = `${profile.firstName} ${profile.lastName}`;
        localStorage.setItem('pulse_user', JSON.stringify(user));
      }

      setSuccessMessage('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      setError('Failed to update profile. Please try again.');
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <DashboardLayout title="Profile Settings">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
          </div>
          <p className="text-gray-300">Manage your personal information and preferences.</p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-900 border border-green-700 text-green-300 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Profile Information */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Profile Information</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Role</label>
                <select 
                  value={profile.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Manager">Manager</option>
                  <option value="Crew Member">Crew Member</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button 
            onClick={handleSave}
            disabled={isLoading}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
