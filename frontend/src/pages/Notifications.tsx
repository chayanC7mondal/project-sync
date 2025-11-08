import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/utils/apiClient";
import { NOTIFICATIONS_LIST, NOTIFICATION_CREATE, NOTIFICATION_MARK_READ } from "@/utils/constants";

// Mock data - will be replaced with API data when backend is ready
const mockNotifications = [
  {
    id: 1,
    type: "reminder",
    title: "Upcoming Court Hearing",
    message: "Case CID/2024/001 scheduled for tomorrow at 10:00 AM in District Court-A",
    time: "2 hours ago",
    read: false,
    priority: "high"
  },
  {
    id: 2,
    type: "alert",
    title: "Attendance Alert",
    message: "IO SI Ramesh Kumar has not marked attendance for today's hearing",
    time: "4 hours ago",
    read: false,
    priority: "urgent"
  },
  {
    id: 3,
    type: "success",
    title: "Attendance Verified",
    message: "All attendance records for Case CID/2024/002 have been verified",
    time: "1 day ago",
    read: true,
    priority: "normal"
  },
  {
    id: 4,
    type: "reminder",
    title: "Witness Reminder Sent",
    message: "SMS reminders sent to 3 witnesses for Case CID/2024/003",
    time: "1 day ago",
    read: true,
    priority: "normal"
  },
  {
    id: 5,
    type: "alert",
    title: "Multiple Absences Detected",
    message: "IO ASI Suresh Nayak has been absent for 2 consecutive hearings",
    time: "2 days ago",
    read: true,
    priority: "high"
  }
];

const Notifications = () => {
  const [notifications, setNotifications] = useState(mockNotifications); // Using mock data initially
  const [loading, setLoading] = useState(false);

  // Fetch all notifications - API function (uncomment when backend is ready)
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(NOTIFICATIONS_LIST);
      setNotifications(response.data);
      toast.success("Notifications loaded");
    } catch (error) {
      toast.error("Failed to fetch notifications");
      console.error("Error fetching notifications:", error);
      // Fallback to mock data on error
      setNotifications(mockNotifications);
    } finally {
      setLoading(false);
    }
  };

  // Create a new notification
  const handleCreateNotification = async (notificationData) => {
    try {
      await apiClient.post(NOTIFICATION_CREATE, notificationData);
      toast.success("Notification created successfully");
      fetchNotifications();
    } catch (error) {
      toast.error("Failed to create notification");
      console.error("Error creating notification:", error);
    }
  };

  // Mark a notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await apiClient.patch(NOTIFICATION_MARK_READ(notificationId));
      toast.success("Notification marked as read");
      fetchNotifications();
    } catch (error) {
      toast.error("Failed to mark notification as read");
      console.error("Error marking notification:", error);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      for (const notification of unreadNotifications) {
        await apiClient.patch(NOTIFICATION_MARK_READ(notification.id));
      }
      toast.success("All notifications marked as read");
      fetchNotifications();
    } catch (error) {
      toast.error("Failed to mark all as read");
      console.error("Error marking all as read:", error);
    }
  };

  // Uncomment this to enable API calls when backend is ready
  // useEffect(() => {
  //   fetchNotifications();
  // }, []);
  const getIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-success" />;
      default:
        return <Bell className="w-5 h-5 text-accent" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-destructive text-destructive-foreground";
      case "high":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1">Stay updated with alerts and reminders</p>
        </div>
        <Button variant="outline" onClick={handleMarkAllAsRead}>
          Mark All as Read
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading notifications...</div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card key={notification.id} className={`glass-card transition-all hover:shadow-lg ${!notification.read ? 'border-l-4 border-l-accent' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{notification.title}</h3>
                          {!notification.read && (
                            <Badge variant="secondary" className="bg-accent text-primary">New</Badge>
                          )}
                          <Badge className={getPriorityColor(notification.priority)}>
                            {notification.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{notification.time}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
