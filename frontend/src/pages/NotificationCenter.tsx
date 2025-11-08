import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  Phone, 
  Mail,
  Users,
  Calendar,
  TrendingUp,
  Send,
  AlertCircle,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/utils/apiClient';

interface Notification {
  _id: string;
  type: 'reminder' | 'alert' | 'success' | 'warning' | 'info';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

interface NotificationStats {
  totalAbsenceReasons: number;
  pendingHearings: number;
  completedHearings: number;
  notificationsSent: number;
  weeklyRemindersScheduled: number;
  dayOfRemindersScheduled: number;
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high' | 'urgent'>('all');
  const [showAbsenceForm, setShowAbsenceForm] = useState(false);
  const [absenceReason, setAbsenceReason] = useState('');
  const [selectedHearing, setSelectedHearing] = useState('');
  const { toast } = useToast();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await apiClient.get('/api/notifications');
      const notificationData = response.data.data || [];
      setNotifications(notificationData);
      setUnreadCount(notificationData.filter((n: Notification) => !n.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchNotifications();
    fetchStats();
    
    // Set up real-time notifications polling
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/api/absence-reasons/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.patch(`/api/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.patch('/api/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const submitAbsenceReason = async () => {
    if (!selectedHearing || !absenceReason) {
      toast({
        title: "Error",
        description: "Please select a hearing and provide a reason",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiClient.post('/api/absence-reasons/submit', {
        hearingSessionId: selectedHearing,
        reason: absenceReason,
      });

      toast({
        title: "Success",
        description: "Absence reason submitted successfully",
      });

      setShowAbsenceForm(false);
      setAbsenceReason('');
      setSelectedHearing('');
    } catch (error) {
      console.error('Error submitting absence reason:', error);
      toast({
        title: "Error",
        description: "Failed to submit absence reason",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (type: string, priority: string) => {
    if (priority === 'urgent') return <AlertTriangle className="w-5 h-5 text-red-500" />;
    if (priority === 'high') return <AlertCircle className="w-5 h-5 text-orange-500" />;
    
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'reminder': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'alert': return <Bell className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread': return !notification.isRead;
      case 'high': return notification.priority === 'high';
      case 'urgent': return notification.priority === 'urgent';
      default: return true;
    }
  });

  const getDashboardContent = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard stats={stats} />;
      case 'io':
        return <IODashboard />;
      case 'liaison':
        return <LiaisonDashboard />;
      case 'witness':
        return <WitnessDashboard />;
      default:
        return <DefaultDashboard />;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading notifications...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notification Center</h1>
          <p className="text-gray-600">
            Welcome, {user.username} ({user.role?.toUpperCase()})
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Badge variant="destructive" className="px-3 py-1">
              {unreadCount} unread
            </Badge>
          )}
          <Button onClick={markAllAsRead} variant="outline">
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Role-specific Dashboard */}
      {getDashboardContent()}

      {/* Notification Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Notification Statistics (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.pendingHearings}</div>
                <div className="text-sm text-gray-600">Pending Hearings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.completedHearings}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.totalAbsenceReasons}</div>
                <div className="text-sm text-gray-600">Absence Reasons</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.notificationsSent}</div>
                <div className="text-sm text-gray-600">Notifications Sent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{stats.weeklyRemindersScheduled}</div>
                <div className="text-sm text-gray-600">Weekly Reminders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.dayOfRemindersScheduled}</div>
                <div className="text-sm text-gray-600">Day-of Reminders</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="actions">Quick Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          {/* Filters */}
          <div className="flex gap-2 mb-4">
            <Select value={filter} onValueChange={(value: 'all' | 'unread' | 'high' | 'urgent') => setFilter(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter notifications" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Notifications</SelectItem>
                <SelectItem value="unread">Unread Only</SelectItem>
                <SelectItem value="urgent">Urgent Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No notifications found</p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card 
                  key={notification._id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => !notification.isRead && markAsRead(notification._id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type, notification.priority)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{notification.title}</h3>
                          <Badge className={getPriorityColor(notification.priority)}>
                            {notification.priority.toUpperCase()}
                          </Badge>
                          {!notification.isRead && (
                            <Badge variant="secondary">NEW</Badge>
                          )}
                        </div>
                        <p className="text-gray-700 mb-2">{notification.message}</p>
                        <div className="text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="actions">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Submit Absence Reason */}
            {(user.role === 'io' || user.role === 'witness') && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Submit Absence Reason
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Submit a reason if you missed a court hearing
                  </p>
                  <Dialog open={showAbsenceForm} onOpenChange={setShowAbsenceForm}>
                    <DialogTrigger asChild>
                      <Button className="w-full">Submit Absence Reason</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Submit Absence Reason</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Hearing Session ID
                          </label>
                          <Input
                            placeholder="Enter hearing session ID"
                            value={selectedHearing}
                            onChange={(e) => setSelectedHearing(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Reason for Absence
                          </label>
                          <Textarea
                            placeholder="Explain why you were absent from the hearing..."
                            value={absenceReason}
                            onChange={(e) => setAbsenceReason(e.target.value)}
                            rows={4}
                          />
                        </div>
                        <Button onClick={submitAbsenceReason} className="w-full">
                          Submit Reason
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            )}

            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  For urgent court-related issues
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>Court Office: +91-XXX-XXX-XXXX</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>Email: court@district.gov.in</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>SMS Service</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Email Service</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Notifications</span>
                    <Badge className="bg-green-100 text-green-800">Running</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Role-specific dashboard components
const AdminDashboard: React.FC<{ stats: NotificationStats | null }> = ({ stats }) => (
  <Alert>
    <Users className="h-4 w-4" />
    <AlertDescription>
      <strong>Admin Dashboard:</strong> You can view all system notifications, manage user alerts, 
      and monitor notification statistics. Use the triggers in Quick Actions to manually send notifications.
    </AlertDescription>
  </Alert>
);

const IODashboard: React.FC = () => (
  <Alert>
    <Calendar className="h-4 w-4" />
    <AlertDescription>
      <strong>Investigating Officer:</strong> You will receive hearing reminders, attendance alerts, 
      and escalation notifications. Submit absence reasons if you miss hearings to avoid disciplinary action.
    </AlertDescription>
  </Alert>
);

const LiaisonDashboard: React.FC = () => (
  <Alert>
    <Bell className="h-4 w-4" />
    <AlertDescription>
      <strong>Liaison Officer:</strong> Monitor today's hearings, track attendance, and receive 
      real-time updates when witnesses mark their attendance via QR codes or manual entry.
    </AlertDescription>
  </Alert>
);

const WitnessDashboard: React.FC = () => (
  <Alert>
    <MessageSquare className="h-4 w-4" />
    <AlertDescription>
      <strong>Witness:</strong> You will receive hearing reminders and attendance confirmations. 
      Make sure to mark your attendance on hearing days and submit reasons if you cannot attend.
    </AlertDescription>
  </Alert>
);

const DefaultDashboard: React.FC = () => (
  <Alert>
    <Info className="h-4 w-4" />
    <AlertDescription>
      Welcome to the Court Management System notification center. You will receive relevant 
      updates and reminders based on your role and case involvement.
    </AlertDescription>
  </Alert>
);

export default NotificationCenter;