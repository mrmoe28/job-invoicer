'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import {
  Calendar,
  TrendingUp,
  Receipt,
  Users,
  Megaphone,
  Zap,
  BarChart3,
  MoreHorizontal,
  ChevronDown,
  Bell,
  Settings,
  User,
  HelpCircle,
  LogOut,
  Home,
  Shield,
  CreditCard,
  LogIn,
  UserPlus
} from 'lucide-react';

interface TopNavigationProps {
  activeTab: string;
  onTabChangeAction: (tab: string) => void;
}

const navigationItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'sales', label: 'Sales', icon: TrendingUp, hasDropdown: true },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
  { id: 'automation', label: 'Automation', icon: Zap },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'more', label: 'More', icon: MoreHorizontal, hasDropdown: true },
];

export function TopNavigation({ activeTab, onTabChangeAction }: TopNavigationProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Stack Auth hooks
  const user = useUser();

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setShowProfileMenu(false);
    // Use Stack Auth handler for logout
    router.push('/handler/sign-out');
  };

  const handleProfileMenuClick = (action: string) => {
    setShowProfileMenu(false);

    switch (action) {
      case 'profile':
        router.push('/handler/account-settings');
        break;
      case 'account-settings':
        router.push('/handler/account-settings');
        break;
      case 'security':
        router.push('/profile/security');
        break;
      case 'billing':
        router.push('/profile/billing');
        break;
      case 'help':
        router.push('/profile/help');
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  // Get user display name and email
  const displayName = user?.displayName || user?.primaryEmail?.split('@')[0] || 'User';
  const userEmail = user?.primaryEmail || '';
  const userInitials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onTabChangeAction('home')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">JI</span>
            </div>
            <span className="font-bold text-xl text-green-600">JOB INVOICER</span>
          </button>

          {/* Navigation Items - Only show when authenticated */}
          {user && (
            <nav className="flex items-center gap-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-sm font-medium",
                      isActive
                        ? "text-blue-600 bg-blue-50 hover:bg-blue-50"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    )}
                    onClick={() => onTabChangeAction(item.id)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    {item.hasDropdown && <ChevronDown className="h-3 w-3 ml-1" />}
                  </Button>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right side - User controls */}
        <div className="flex items-center gap-3">
          {user ? (
            // Authenticated user controls
            <>
              {/* Notification Bell */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  1
                </span>
              </Button>

              {/* User Avatar and Menu */}
              <div className="relative" ref={profileMenuRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 px-3 py-2"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  disabled={isLoggingOut}
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">{userInitials}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{displayName}</span>
                  <ChevronDown className="h-3 w-3 text-gray-500" />
                </Button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900">{displayName}</div>
                      <div className="text-xs text-gray-500">{userEmail}</div>
                    </div>

                    <Button
                      variant="ghost"
                      className="w-full justify-start px-4 py-2 text-sm"
                      onClick={() => handleProfileMenuClick('profile')}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full justify-start px-4 py-2 text-sm"
                      onClick={() => handleProfileMenuClick('account-settings')}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full justify-start px-4 py-2 text-sm"
                      onClick={() => handleProfileMenuClick('security')}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Security
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full justify-start px-4 py-2 text-sm"
                      onClick={() => handleProfileMenuClick('billing')}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Billing
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full justify-start px-4 py-2 text-sm"
                      onClick={() => handleProfileMenuClick('help')}
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Help & Support
                    </Button>

                    <hr className="my-1" />

                    <Button
                      variant="ghost"
                      className="w-full justify-start px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleProfileMenuClick('logout')}
                      disabled={isLoggingOut}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {isLoggingOut ? 'Signing out...' : 'Sign out'}
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Unauthenticated user controls
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/login')}
                className="flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                Sign in
              </Button>

              <Button
                size="sm"
                onClick={() => router.push('/signup')}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4" />
                Sign up
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 