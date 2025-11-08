import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

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
  const [notifications, setNotifications] = useState(mockNotifications);

  // Mark a notification as read (static operation - removes from list)
  const handleMarkAsRead = (notificationId: number) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    toast.success("Notification removed");
  };

  // Mark all notifications as read (static operation - removes all unread)
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.filter(n => n.read));
    toast.success("All unread notifications removed");
  };
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

      {notifications.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No notifications to display</p>
          </CardContent>
        </Card>
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
