'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/core/layouts/DashboardLayout';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { useNotifications } from '@/components/providers/NotificationProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  HardHat, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthContext();
  const { success, info } = useNotifications();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Mock data - in production, this would come from API calls
  const stats = {
    totalCustomers: 1247,
    activeContractors: 89,
    pendingDocuments: 23,
    monthlyRevenue: 542000,
    revenueGrowth: 12.5,
    completedProjects: 156,
    projectsThisMonth: 34,
    pendingSignatures: 8,
  };

  const recentActivities = [
    {
      id: 1,
      type: 'customer',
      title: 'New customer inquiry',
      description: 'Sarah Johnson submitted a solar quote request',
      time: '2 hours ago',
      status: 'new'
    },
    {
      id: 2,
      type: 'document',
      title: 'Contract signed',
      description: 'Michael Davis signed the installation contract',
      time: '4 hours ago',
      status: 'completed'
    },
    {
      id: 3,
      type: 'contractor',
      title: 'Installation completed',
      description: 'Team Alpha finished the Rodriguez residence project',
      time: '6 hours ago',
      status: 'completed'
    },
    {
      id: 4,
      type: 'document',
      title: 'Signature pending',
      description: 'Permit application awaiting city approval signature',
      time: '1 day ago',
      status: 'pending'
    },
  ];

  const upcomingTasks = [
    {
      id: 1,
      title: 'Site inspection - Williams residence',
      dueDate: 'Today, 2:00 PM',
      priority: 'high',
      assignee: 'Team Beta'
    },
    {
      id: 2,
      title: 'Follow up with pending proposals',
      dueDate: 'Tomorrow, 9:00 AM',
      priority: 'medium',
      assignee: 'Sales Team'
    },
    {
      id: 3,
      title: 'Equipment delivery coordination',
      dueDate: 'Friday, 10:00 AM',
      priority: 'low',
      assignee: 'Logistics'
    },
  ];

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-customer':
        info('Redirecting to add customer form...');
        // Navigate to add customer
        break;
      case 'create-proposal':
        info('Opening proposal creator...');
        // Navigate to proposal creator
        break;
      case 'schedule-inspection':
        info('Opening scheduling interface...');
        // Navigate to scheduling
        break;
      default:
        break;
    }
  };

  const getActivityIcon = (type: string, status: string) => {
    if (type === 'customer') return <Users className="h-4 w-4" />;
    if (type === 'contractor') return <HardHat className="h-4 w-4" />;
    if (type === 'document') {
      return status === 'completed' ? <CheckCircle className="h-4 w-4" /> : <FileText className="h-4 w-4" />;
    }
    return <Clock className="h-4 w-4" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout
      title={`Welcome back, ${user?.firstName}!`}
      subtitle="Here's what's happening with your solar business today."
      sidebarCollapsed={sidebarCollapsed}
      onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contractors</CardTitle>
            <HardHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeContractors}</div>
            <p className="text-xs text-muted-foreground">
              +3 new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingDocuments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingSignatures} awaiting signatures
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.monthlyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{stats.revenueGrowth}% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your solar business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type, activity.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                  <Badge 
                    variant={activity.status === 'completed' ? 'default' : 'secondary'}
                    className={activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                  >
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>
              Tasks and deadlines to keep track of
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center space-x-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-gray-500">{task.dueDate}</p>
                    <p className="text-xs text-gray-400">Assigned to: {task.assignee}</p>
                  </div>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks to help you work more efficiently
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col space-y-2"
              onClick={() => handleQuickAction('add-customer')}
            >
              <Users className="h-6 w-6" />
              <span>Add New Customer</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col space-y-2"
              onClick={() => handleQuickAction('create-proposal')}
            >
              <FileText className="h-6 w-6" />
              <span>Create Proposal</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col space-y-2"
              onClick={() => handleQuickAction('schedule-inspection')}
            >
              <Calendar className="h-6 w-6" />
              <span>Schedule Inspection</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Progress</CardTitle>
          <CardDescription>
            Track your business metrics and goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Projects Completed</span>
                <span>{stats.projectsThisMonth} / 40</span>
              </div>
              <Progress value={(stats.projectsThisMonth / 40) * 100} />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Revenue Goal</span>
                <span>${stats.monthlyRevenue.toLocaleString()} / $600,000</span>
              </div>
              <Progress value={(stats.monthlyRevenue / 600000) * 100} />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Customer Satisfaction</span>
                <span>94% / 95%</span>
              </div>
              <Progress value={94} />
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}