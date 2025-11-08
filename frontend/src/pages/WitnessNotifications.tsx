import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Search,
  Filter,
  LayoutDashboard,
  AlertCircle,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  MapPin,
} from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  case_number?: string;
  date: string;
  time: string;
  priority: string;
  read: boolean;
  action_required: boolean;
}

const WitnessNotifications = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Dummy notifications for witness
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "N001",
      type: "Hearing",
      title: "Upcoming Hearing Tomorrow",
      message: "Hearing scheduled for case CR/001/2025 at 10:00 AM in Court Room 1. Your presence is required.",
      case_number: "CR/001/2025",
      date: "2025-11-08",
      time: "09:00 AM",
      priority: "High",
      read: false,
      action_required: true,
    },
    {
      id: "N002",
      type: "Attendance",
      title: "Mark Your Attendance",
      message: "Don't forget to mark your attendance for the hearing on Nov 12, 2025",
      case_number: "CR/001/2025",
      date: "2025-11-07",
      time: "02:30 PM",
      priority: "High",
      read: false,
      action_required: true,
    },
    {
      id: "N003",
      type: "Statement",
      title: "Statement Recording Scheduled",
      message: "Your statement recording is scheduled for case CR/019/2025 on Nov 10, 2025 at 11:00 AM",
      case_number: "CR/019/2025",
      date: "2025-11-07",
      time: "11:15 AM",
      priority: "High",
      read: false,
      action_required: true,
    },
    {
      id: "N004",
      type: "Case",
      title: "Added as Witness",
      message: "You have been added as a witness in case CR/023/2025 (Property Dispute)",
      case_number: "CR/023/2025",
      date: "2025-11-06",
      time: "03:45 PM",
      priority: "Medium",
      read: true,
      action_required: false,
    },
    {
      id: "N005",
      type: "Hearing",
      title: "Hearing Rescheduled",
      message: "Hearing for case CR/009/2025 has been rescheduled to 2025-11-16",
      case_number: "CR/009/2025",
      date: "2025-11-06",
      time: "10:00 AM",
      priority: "Medium",
      read: true,
      action_required: false,
    },
    {
      id: "N006",
      type: "Attendance",
      title: "Attendance Marked Successfully",
      message: "Your attendance for hearing on Oct 28, 2025 has been marked successfully",
      case_number: "CR/001/2025",
      date: "2025-10-28",
      time: "09:50 AM",
      priority: "Low",
      read: true,
      action_required: false,
    },
    {
      id: "N007",
      type: "Document",
      title: "Document Submitted",
      message: "Your witness statement for case CR/014/2025 has been submitted",
      case_number: "CR/014/2025",
      date: "2025-10-25",
      time: "04:20 PM",
      priority: "Low",
      read: true,
      action_required: false,
    },
    {
      id: "N008",
      type: "Hearing",
      title: "Hearing Completed",
      message: "Hearing for case CR/005/2025 completed on Oct 20, 2025. Thank you for your presence.",
      case_number: "CR/005/2025",
      date: "2025-10-20",
      time: "03:30 PM",
      priority: "Low",
      read: true,
      action_required: false,
    },
    {
      id: "N009",
      type: "Reminder",
      title: "Upcoming Hearing Reminder",
      message: "Reminder: You have a hearing for case CR/005/2025 on Nov 14, 2025 at 02:00 PM",
      case_number: "CR/005/2025",
      date: "2025-11-07",
      time: "08:00 AM",
      priority: "Medium",
      read: false,
      action_required: true,
    },
    {
      id: "N010",
      type: "Statement",
      title: "Statement Pending",
      message: "Your statement is still pending for case CR/009/2025. Please contact IO Suresh Dash",
      case_number: "CR/009/2025",
      date: "2025-11-05",
      time: "02:15 PM",
      priority: "High",
      read: false,
      action_required: true,
    },
  ]);

  const getTypeIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      Hearing: <Calendar className="w-5 h-5 text-blue-500" />,
      Attendance: <CheckCircle className="w-5 h-5 text-green-500" />,
      Statement: <FileText className="w-5 h-5 text-purple-500" />,
      Case: <FileText className="w-5 h-5 text-orange-500" />,
      Document: <FileText className="w-5 h-5 text-teal-500" />,
      Reminder: <Clock className="w-5 h-5 text-yellow-500" />,
    };
    return icons[type] || <Bell className="w-5 h-5 text-gray-500" />;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<
      string,
      { variant: "default" | "secondary" | "destructive" | "outline"; className?: string }
    > = {
      High: { variant: "destructive" },
      Medium: { variant: "default", className: "bg-orange-500" },
      Low: { variant: "secondary" },
    };

    const config = priorityConfig[priority] || { variant: "secondary" };
    return (
      <Badge variant={config.variant} className={config.className}>
        {priority}
      </Badge>
    );
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (notification.case_number &&
        notification.case_number.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === "all" || notification.type === typeFilter;
    const matchesPriority = priorityFilter === "all" || notification.priority === priorityFilter;
    return matchesSearch && matchesType && matchesPriority;
  });

  const unreadNotifications = filteredNotifications.filter((n) => !n.read);
  const readNotifications = filteredNotifications.filter((n) => n.read);

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-green-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Notifications</h1>
          <p className="text-gray-600 mt-2">Stay updated on your case hearings and requirements</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
          <Button onClick={() => navigate("/")}>
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Notifications</p>
                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.filter((n) => !n.read).length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Action Required</p>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.filter((n) => n.action_required).length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.filter((n) => n.priority === "High").length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by title, message, or case number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Hearing">Hearing</SelectItem>
                <SelectItem value="Attendance">Attendance</SelectItem>
                <SelectItem value="Statement">Statement</SelectItem>
                <SelectItem value="Case">Case</SelectItem>
                <SelectItem value="Document">Document</SelectItem>
                <SelectItem value="Reminder">Reminder</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Unread Notifications */}
      {unreadNotifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Unread Notifications ({unreadNotifications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {unreadNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className="border-l-4 border-l-blue-500 bg-blue-50 hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="mt-1">{getTypeIcon(notification.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                            {notification.action_required && (
                              <Badge variant="destructive" className="text-xs">
                                Action Required
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                          {notification.case_number && (
                            <p className="text-xs text-gray-500 font-medium">
                              Case: {notification.case_number}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getPriorityBadge(notification.priority)}
                        <p className="text-xs text-gray-500">
                          {new Date(notification.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">{notification.time}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark Read
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Read Notifications */}
      {readNotifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Read Notifications ({readNotifications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {readNotifications.map((notification) => (
                <Card key={notification.id} className="bg-gray-50 opacity-75">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="mt-1">{getTypeIcon(notification.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-700">{notification.title}</h3>
                            {notification.action_required && (
                              <Badge variant="outline" className="text-xs">
                                Action Required
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{notification.message}</p>
                          {notification.case_number && (
                            <p className="text-xs text-gray-400 font-medium">
                              Case: {notification.case_number}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getPriorityBadge(notification.priority)}
                        <p className="text-xs text-gray-400">
                          {new Date(notification.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400">{notification.time}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WitnessNotifications;
