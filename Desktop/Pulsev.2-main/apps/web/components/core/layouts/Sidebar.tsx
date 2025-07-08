'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Home,
  Users,
  HardHat,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building,
  MessageSquare,
  CheckSquare,
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: number;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Customers',
    href: '/dashboard/contacts',
    icon: Users,
  },
  {
    title: 'Contractors',
    href: '/dashboard/contractors',
    icon: HardHat,
  },
  {
    title: 'Documents',
    href: '/dashboard/documents',
    icon: FileText,
    badge: 3, // Example: pending signatures
  },
  {
    title: 'Jobs',
    href: '/dashboard/jobs',
    icon: Building,
  },
  {
    title: 'Schedule',
    href: '/dashboard/scheduling',
    icon: Calendar,
  },
  {
    title: 'Tasks',
    href: '/dashboard/tasks',
    icon: CheckSquare,
    badge: 5, // Example: pending tasks
  },
  {
    title: 'Reports',
    href: '/dashboard/reports',
    icon: BarChart3,
  },
  {
    title: 'Live Chat',
    href: '/dashboard/live-chat',
    icon: MessageSquare,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const isActiveLink = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const SidebarItem = ({ item }: { item: NavItem }) => {
    const isActive = isActiveLink(item.href);
    const Icon = item.icon;

    const content = (
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-gray-100 dark:hover:bg-gray-800',
          {
            'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400': isActive,
            'text-gray-700 dark:text-gray-300': !isActive,
            'justify-center px-2': collapsed,
          }
        )}
      >
        <Icon className={cn('h-5 w-5 flex-shrink-0', {
          'text-orange-600 dark:text-orange-400': isActive,
        })} />
        {!collapsed && (
          <>
            <span className="flex-1">{item.title}</span>
            {item.badge && item.badge > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {item.badge > 99 ? '99+' : item.badge}
              </Badge>
            )}
          </>
        )}
      </Link>
    );

    if (collapsed) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {content}
            </TooltipTrigger>
            <TooltipContent side="right" className="flex items-center gap-2">
              {item.title}
              {item.badge && item.badge > 0 && (
                <Badge variant="secondary" className="h-4 px-1 text-xs">
                  {item.badge > 99 ? '99+' : item.badge}
                </Badge>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return content;
  };

  return (
    <div
      className={cn(
        'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300',
        {
          'w-64': !collapsed,
          'w-16': collapsed,
        }
      )}
    >
      <div className="flex h-full flex-col">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {!collapsed && (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Navigation
            </h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="p-1.5 h-auto"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 p-4">
          {navigationItems.map((item) => (
            <SidebarItem key={item.href} item={item} />
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          {!collapsed && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p>© 2025 Pulse CRM</p>
              <p>Version 2.0</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}