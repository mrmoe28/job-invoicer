'use client';

import { useState, useEffect } from 'react';

interface FeatureUpdate {
  id: string;
  version: string;
  title: string;
  description: string;
  features: string[];
  date: string;
  type: 'feature' | 'improvement' | 'fix';
}

// Current feature updates - add new ones here when features are added
const FEATURE_UPDATES: FeatureUpdate[] = [
  {
    id: 'update-2024-12-30-fixes',
    version: '1.3.1',
    title: 'Document Viewing & Profile Improvements',
    description: 'We\'ve enhanced the document viewing experience and profile customization!',
    features: [
      'Fixed PDF document viewing with improved error handling',
      'Profile images now appear in top navigation bar',
      'Added multiple PDF fallback URLs for better reliability',
      'Enhanced error messages with retry functionality'
    ],
    date: 'December 30, 2024',
    type: 'improvement'
  },
  {
    id: 'update-2024-12-30-admin',
    version: '1.3.0',
    title: 'Custom Admin Login & Simplified Signup',
    description: 'We\'ve streamlined the signup process and added custom admin access!',
    features: [
      'Added custom admin login with enterprise privileges',
      'Simplified signup from 3 steps to 2 steps',
      'Removed subscription complexity for cleaner onboarding',
      'Professional plan now default for all new organizations'
    ],
    date: 'December 30, 2024',
    type: 'feature'
  },
  {
    id: 'update-2024-12-30',
    version: '1.2.0',
    title: 'New Features & Improvements',
    description: 'We\'ve added exciting new functionality to enhance your experience!',
    features: [
      'Fixed schedule saving with proper validation and loading states',
      'Enhanced PDF document viewer with improved compatibility', 
      'Added profile image upload functionality with preview',
      'Improved error handling across all forms'
    ],
    date: 'December 30, 2024',
    type: 'feature'
  }
];

export default function FeatureNotification() {
  const [currentNotification, setCurrentNotification] = useState<FeatureUpdate | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check for unseen notifications
    const seenNotifications = JSON.parse(localStorage.getItem('seenNotifications') || '[]');
    const unseenNotification = FEATURE_UPDATES.find(update => 
      !seenNotifications.includes(update.id)
    );

    if (unseenNotification) {
      setCurrentNotification(unseenNotification);
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    if (currentNotification) {
      // Mark as seen
      const seenNotifications = JSON.parse(localStorage.getItem('seenNotifications') || '[]');
      seenNotifications.push(currentNotification.id);
      localStorage.setItem('seenNotifications', JSON.stringify(seenNotifications));
      
      setIsVisible(false);
      setTimeout(() => setCurrentNotification(null), 300);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'feature':
        return (
          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'improvement':
        return (
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'fix':
        return (
          <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (!currentNotification || !isVisible) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleDismiss}
      />

      {/* Notification Card */}
      <div 
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              {getIconForType(currentNotification.type)}
              <div>
                <h3 className="text-lg font-semibold text-white">{currentNotification.title}</h3>
                <p className="text-sm text-gray-400">Version {currentNotification.version}</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-white transition-colors"
              title="Dismiss notification"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-300 mb-4">{currentNotification.description}</p>
            
            <div className="space-y-2">
              <h4 className="text-white font-medium text-sm">What's New:</h4>
              <ul className="space-y-2">
                {currentNotification.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-xs text-gray-500">{currentNotification.date}</span>
              <button
                onClick={handleDismiss}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}