'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../../components/dashboard-layout';
import { trpc } from '@/lib/trpc';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  profileImage?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'Administrator',
    profileImage: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user data from localStorage on component mount
  useEffect(() => {
    const userData = localStorage.getItem('pulse_user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const userProfile = {
          firstName: user.name?.split(' ')[0] || '',
          lastName: user.name?.split(' ')[1] || '',
          email: user.email || '',
          phone: user.phone || '', // Added phone storage
          role: user.role || 'Administrator',
          profileImage: user.profileImage || ''
        };
        setProfile(userProfile);
        if (userProfile.profileImage) {
          setPreviewImage(userProfile.profileImage);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (JPG, PNG, GIF)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewImage(result);
      };
      reader.readAsDataURL(file);
      
      // Clear any existing errors
      setError('');
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewImage('');
    setProfile(prev => ({ ...prev, profileImage: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

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
      
      // Update localStorage with new data including profile image
      const userData = localStorage.getItem('pulse_user');
      if (userData) {
        const user = JSON.parse(userData);
        user.name = `${profile.firstName} ${profile.lastName}`;
        user.email = profile.email;
        user.phone = profile.phone;
        user.role = profile.role;
        
        // Save profile image if one was selected
        if (previewImage) {
          user.profileImage = previewImage;
          setProfile(prev => ({ ...prev, profileImage: previewImage }));
        }
        
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

        {/* Profile Photo */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Profile Photo</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center space-x-6">
              {/* Current Avatar */}
              <div className="relative">
                {previewImage || profile.profileImage ? (
                  <img
                    src={previewImage || profile.profileImage}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-600"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-600 border-4 border-gray-600 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                
                {/* Remove button - only show if there's an image */}
                {(previewImage || profile.profileImage) && (
                  <button
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-sm transition-colors"
                    title="Remove photo"
                  >
                    ×
                  </button>
                )}
              </div>
              
              {/* Upload Controls */}
              <div className="flex-1">
                <div className="mb-4">
                  <h4 className="text-white font-medium mb-2">Upload a new photo</h4>
                  <p className="text-gray-400 text-sm mb-4">
                    JPG, PNG or GIF. Max file size: 5MB. Recommended size: 400x400px
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleImageUpload}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Choose File
                  </button>
                  
                  {selectedFile && (
                    <div className="flex items-center text-sm text-gray-300">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {selectedFile.name}
                    </div>
                  )}
                </div>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>

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
