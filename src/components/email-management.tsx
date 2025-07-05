'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Mail,
    Send,
    Plus,
    Edit,
    Trash2,
    Eye,
    Copy,
    TrendingUp,
    Settings,
    BarChart3,
    FileText,
    Search,
    Download,
    Zap
} from 'lucide-react';

interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    content: string;
    type: 'invoice' | 'welcome' | 'followup' | 'marketing' | 'reminder' | 'custom';
    isActive: boolean;
    createdAt: string;
    lastUsed?: string;
    usage: number;
}

interface EmailCampaign {
    id: string;
    name: string;
    subject: string;
    templateId: string;
    recipients: Array<{
        email: string;
        name: string;
        customFields?: Record<string, string>;
    }>;
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
    scheduledAt?: string;
    sentAt?: string;
    stats: {
        sent: number;
        delivered: number;
        opened: number;
        clicked: number;
        bounced: number;
        unsubscribed: number;
    };
    createdAt: string;
}

interface EmailHistory {
    id: string;
    to: string;
    subject: string;
    templateId?: string;
    campaignId?: string;
    status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
    sentAt: string;
    openedAt?: string;
    clickedAt?: string;
    errorMessage?: string;
}

export function EmailManagement() {
    const [activeTab, setActiveTab] = useState('compose');
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
    const [emailHistory, setEmailHistory] = useState<EmailHistory[]>([]);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Email compose form
    const [composeForm, setComposeForm] = useState({
        to: '',
        cc: '',
        bcc: '',
        subject: '',
        content: '',
        templateId: '',
        scheduleAt: '',
        isScheduled: false
    });

    // Template form
    const [templateForm, setTemplateForm] = useState({
        name: '',
        subject: '',
        content: '',
        type: 'custom' as EmailTemplate['type'],
        isActive: true
    });

    // Campaign form
    const [campaignForm, setCampaignForm] = useState({
        name: '',
        subject: '',
        templateId: '',
        recipients: '',
        scheduleAt: '',
        isScheduled: false
    });

    useEffect(() => {
        fetchEmailData();
    }, []);

    const fetchEmailData = async () => {
        setLoading(true);
        try {
            // Mock data - replace with actual API calls
            setTemplates([
                {
                    id: '1',
                    name: 'Welcome Email',
                    subject: 'Welcome to {{company_name}}!',
                    content: 'Dear {{customer_name}},\n\nWelcome to our service! We\'re excited to have you on board.',
                    type: 'welcome',
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    usage: 25
                },
                {
                    id: '2',
                    name: 'Invoice Reminder',
                    subject: 'Invoice {{invoice_number}} Due Soon',
                    content: 'Dear {{customer_name}},\n\nYour invoice #{{invoice_number}} for {{amount}} is due on {{due_date}}.',
                    type: 'reminder',
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    usage: 15
                }
            ]);

            setCampaigns([
                {
                    id: '1',
                    name: 'Monthly Newsletter',
                    subject: 'Your Monthly Update',
                    templateId: '1',
                    recipients: [],
                    status: 'sent',
                    sentAt: new Date().toISOString(),
                    stats: {
                        sent: 150,
                        delivered: 148,
                        opened: 89,
                        clicked: 23,
                        bounced: 2,
                        unsubscribed: 1
                    },
                    createdAt: new Date().toISOString()
                }
            ]);

            setEmailHistory([
                {
                    id: '1',
                    to: 'customer@example.com',
                    subject: 'Invoice #INV-001 Due Soon',
                    templateId: '2',
                    status: 'delivered',
                    sentAt: new Date().toISOString()
                }
            ]);
        } catch (error) {
            console.error('Error fetching email data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmail = async () => {
        if (!composeForm.to || !composeForm.subject) {
            alert('Please fill in required fields');
            return;
        }

        setLoading(true);
        try {
            // API call to send email
            const response = await fetch('/api/emails/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(composeForm)
            });

            if (response.ok) {
                alert('Email sent successfully!');
                setComposeForm({
                    to: '',
                    cc: '',
                    bcc: '',
                    subject: '',
                    content: '',
                    templateId: '',
                    scheduleAt: '',
                    isScheduled: false
                });
                fetchEmailData();
            } else {
                throw new Error('Failed to send email');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Failed to send email');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTemplate = async () => {
        if (!templateForm.name || !templateForm.subject) {
            alert('Please fill in required fields');
            return;
        }

        setLoading(true);
        try {
            const method = editingTemplate ? 'PUT' : 'POST';
            const url = editingTemplate
                ? `/api/emails/templates/${editingTemplate.id}`
                : '/api/emails/templates';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(templateForm)
            });

            if (response.ok) {
                alert(`Template ${editingTemplate ? 'updated' : 'created'} successfully!`);
                setIsTemplateModalOpen(false);
                setEditingTemplate(null);
                setTemplateForm({
                    name: '',
                    subject: '',
                    content: '',
                    type: 'custom',
                    isActive: true
                });
                fetchEmailData();
            } else {
                throw new Error('Failed to save template');
            }
        } catch (error) {
            console.error('Error saving template:', error);
            alert('Failed to save template');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCampaign = async () => {
        if (!campaignForm.name || !campaignForm.templateId) {
            alert('Please fill in required fields');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/emails/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(campaignForm)
            });

            if (response.ok) {
                alert('Campaign created successfully!');
                setIsCampaignModalOpen(false);
                setCampaignForm({
                    name: '',
                    subject: '',
                    templateId: '',
                    recipients: '',
                    scheduleAt: '',
                    isScheduled: false
                });
                fetchEmailData();
            } else {
                throw new Error('Failed to create campaign');
            }
        } catch (error) {
            console.error('Error creating campaign:', error);
            alert('Failed to create campaign');
        } finally {
            setLoading(false);
        }
    };

    const openTemplateModal = (template?: EmailTemplate) => {
        if (template) {
            setEditingTemplate(template);
            setTemplateForm({
                name: template.name,
                subject: template.subject,
                content: template.content,
                type: template.type,
                isActive: template.isActive
            });
        }
        setIsTemplateModalOpen(true);
    };

    const filteredHistory = emailHistory.filter(email =>
        email.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const emailStats = {
        totalSent: emailHistory.length,
        totalDelivered: emailHistory.filter(e => e.status === 'delivered').length,
        totalOpened: emailHistory.filter(e => e.status === 'opened').length,
        totalTemplates: templates.length,
        activeCampaigns: campaigns.filter(c => c.status === 'sending').length
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Email Management</h1>
                    <p className="text-gray-600">Send emails, manage templates, and track campaigns</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => fetchEmailData()}>
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                    </Button>
                    <Button onClick={() => setIsTemplateModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Template
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Send className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Sent</p>
                                <p className="text-2xl font-bold">{emailStats.totalSent}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Delivered</p>
                                <p className="text-2xl font-bold">{emailStats.totalDelivered}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Eye className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Opened</p>
                                <p className="text-2xl font-bold">{emailStats.totalOpened}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <FileText className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Templates</p>
                                <p className="text-2xl font-bold">{emailStats.totalTemplates}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <Zap className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Active Campaigns</p>
                                <p className="text-2xl font-bold">{emailStats.activeCampaigns}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="compose">Compose</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                {/* Compose Tab */}
                <TabsContent value="compose" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                Compose Email
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="to">To *</Label>
                                    <Input
                                        id="to"
                                        placeholder="recipient@example.com"
                                        value={composeForm.to}
                                        onChange={(e) => setComposeForm(prev => ({ ...prev, to: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="cc">CC</Label>
                                    <Input
                                        id="cc"
                                        placeholder="cc@example.com"
                                        value={composeForm.cc}
                                        onChange={(e) => setComposeForm(prev => ({ ...prev, cc: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="bcc">BCC</Label>
                                    <Input
                                        id="bcc"
                                        placeholder="bcc@example.com"
                                        value={composeForm.bcc}
                                        onChange={(e) => setComposeForm(prev => ({ ...prev, bcc: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="subject">Subject *</Label>
                                <Input
                                    id="subject"
                                    placeholder="Email subject"
                                    value={composeForm.subject}
                                    onChange={(e) => setComposeForm(prev => ({ ...prev, subject: e.target.value }))}
                                />
                            </div>

                            <div>
                                <Label htmlFor="template">Use Template (Optional)</Label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    value={composeForm.templateId}
                                    onChange={(e) => {
                                        const template = templates.find(t => t.id === e.target.value);
                                        if (template) {
                                            setComposeForm(prev => ({
                                                ...prev,
                                                templateId: e.target.value,
                                                subject: template.subject,
                                                content: template.content
                                            }));
                                        } else {
                                            setComposeForm(prev => ({ ...prev, templateId: '' }));
                                        }
                                    }}
                                >
                                    <option value="">Select a template...</option>
                                    {templates.map(template => (
                                        <option key={template.id} value={template.id}>
                                            {template.name} ({template.type})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="content">Message *</Label>
                                <Textarea
                                    id="content"
                                    placeholder="Email content..."
                                    rows={8}
                                    value={composeForm.content}
                                    onChange={(e) => setComposeForm(prev => ({ ...prev, content: e.target.value }))}
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="schedule"
                                        checked={composeForm.isScheduled}
                                        onCheckedChange={(checked) => setComposeForm(prev => ({ ...prev, isScheduled: checked }))}
                                    />
                                    <Label htmlFor="schedule">Schedule for later</Label>
                                </div>
                                {composeForm.isScheduled && (
                                    <Input
                                        type="datetime-local"
                                        value={composeForm.scheduleAt}
                                        onChange={(e) => setComposeForm(prev => ({ ...prev, scheduleAt: e.target.value }))}
                                    />
                                )}
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button variant="outline">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Save as Draft
                                </Button>
                                <Button onClick={handleSendEmail} disabled={loading}>
                                    <Send className="h-4 w-4 mr-2" />
                                    {composeForm.isScheduled ? 'Schedule Email' : 'Send Email'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Templates Tab */}
                <TabsContent value="templates" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Email Templates</h3>
                        <Button onClick={() => openTemplateModal()}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Template
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templates.map(template => (
                            <Card key={template.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">{template.name}</CardTitle>
                                            <Badge variant={template.isActive ? 'default' : 'secondary'}>
                                                {template.type}
                                            </Badge>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="sm" onClick={() => openTemplateModal(template)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600 mb-2">Subject: {template.subject}</p>
                                    <p className="text-xs text-gray-500">Used {template.usage} times</p>
                                    <p className="text-xs text-gray-500">
                                        Created: {new Date(template.createdAt).toLocaleDateString()}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Campaigns Tab */}
                <TabsContent value="campaigns" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Email Campaigns</h3>
                        <Button onClick={() => setIsCampaignModalOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Campaign
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {campaigns.map(campaign => (
                            <Card key={campaign.id}>
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="text-lg font-semibold">{campaign.name}</h4>
                                            <p className="text-gray-600">{campaign.subject}</p>
                                            <Badge variant={
                                                campaign.status === 'sent' ? 'default' :
                                                    campaign.status === 'sending' ? 'secondary' :
                                                        campaign.status === 'scheduled' ? 'outline' : 'destructive'
                                            }>
                                                {campaign.status}
                                            </Badge>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500">Sent</p>
                                            <p className="font-semibold">{campaign.stats.sent}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Delivered</p>
                                            <p className="font-semibold">{campaign.stats.delivered}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Opened</p>
                                            <p className="font-semibold">{campaign.stats.opened}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Clicked</p>
                                            <p className="font-semibold">{campaign.stats.clicked}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Bounced</p>
                                            <p className="font-semibold">{campaign.stats.bounced}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Unsubscribed</p>
                                            <p className="font-semibold">{campaign.stats.unsubscribed}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Email History</h3>
                        <div className="flex gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search emails..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Button variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>

                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Recipient</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Sent At</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredHistory.map(email => (
                                    <TableRow key={email.id}>
                                        <TableCell>{email.to}</TableCell>
                                        <TableCell>{email.subject}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                email.status === 'delivered' ? 'default' :
                                                    email.status === 'sent' ? 'secondary' :
                                                        email.status === 'opened' ? 'outline' : 'destructive'
                                            }>
                                                {email.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(email.sentAt).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Email Performance
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span>Delivery Rate</span>
                                        <span className="font-semibold">
                                            {emailStats.totalSent > 0
                                                ? `${Math.round((emailStats.totalDelivered / emailStats.totalSent) * 100)}%`
                                                : '0%'
                                            }
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Open Rate</span>
                                        <span className="font-semibold">
                                            {emailStats.totalDelivered > 0
                                                ? `${Math.round((emailStats.totalOpened / emailStats.totalDelivered) * 100)}%`
                                                : '0%'
                                            }
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Recent Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8">
                                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">Email analytics charts coming soon</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Template Modal */}
            <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingTemplate ? 'Edit Template' : 'Create New Template'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="template-name">Template Name *</Label>
                            <Input
                                id="template-name"
                                placeholder="Template name"
                                value={templateForm.name}
                                onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="template-type">Type</Label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded-md"
                                value={templateForm.type}
                                onChange={(e) => setTemplateForm(prev => ({ ...prev, type: e.target.value as EmailTemplate['type'] }))}
                            >
                                <option value="custom">Custom</option>
                                <option value="welcome">Welcome</option>
                                <option value="invoice">Invoice</option>
                                <option value="reminder">Reminder</option>
                                <option value="followup">Follow-up</option>
                                <option value="marketing">Marketing</option>
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="template-subject">Subject *</Label>
                            <Input
                                id="template-subject"
                                placeholder="Email subject (use {{variable}} for dynamic content)"
                                value={templateForm.subject}
                                onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="template-content">Content *</Label>
                            <Textarea
                                id="template-content"
                                placeholder="Email content (use {{variable}} for dynamic content)"
                                rows={8}
                                value={templateForm.content}
                                onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="template-active"
                                checked={templateForm.isActive}
                                onCheckedChange={(checked) => setTemplateForm(prev => ({ ...prev, isActive: checked }))}
                            />
                            <Label htmlFor="template-active">Active</Label>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setIsTemplateModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSaveTemplate} disabled={loading}>
                                {editingTemplate ? 'Update' : 'Create'} Template
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Campaign Modal */}
            <Dialog open={isCampaignModalOpen} onOpenChange={setIsCampaignModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create New Campaign</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="campaign-name">Campaign Name *</Label>
                            <Input
                                id="campaign-name"
                                placeholder="Campaign name"
                                value={campaignForm.name}
                                onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="campaign-template">Template *</Label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded-md"
                                value={campaignForm.templateId}
                                onChange={(e) => setCampaignForm(prev => ({ ...prev, templateId: e.target.value }))}
                            >
                                <option value="">Select a template...</option>
                                {templates.map(template => (
                                    <option key={template.id} value={template.id}>
                                        {template.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="campaign-subject">Subject Override</Label>
                            <Input
                                id="campaign-subject"
                                placeholder="Override template subject"
                                value={campaignForm.subject}
                                onChange={(e) => setCampaignForm(prev => ({ ...prev, subject: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="campaign-recipients">Recipients</Label>
                            <Textarea
                                id="campaign-recipients"
                                placeholder="Enter email addresses, one per line"
                                rows={4}
                                value={campaignForm.recipients}
                                onChange={(e) => setCampaignForm(prev => ({ ...prev, recipients: e.target.value }))}
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="campaign-schedule"
                                    checked={campaignForm.isScheduled}
                                    onCheckedChange={(checked) => setCampaignForm(prev => ({ ...prev, isScheduled: checked }))}
                                />
                                <Label htmlFor="campaign-schedule">Schedule for later</Label>
                            </div>
                            {campaignForm.isScheduled && (
                                <Input
                                    type="datetime-local"
                                    value={campaignForm.scheduleAt}
                                    onChange={(e) => setCampaignForm(prev => ({ ...prev, scheduleAt: e.target.value }))}
                                />
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setIsCampaignModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateCampaign} disabled={loading}>
                                Create Campaign
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
} 