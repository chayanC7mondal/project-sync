import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Palette,
  Bell,
  Shield,
  QrCode,
  Mail,
  Clock,
  Save,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/utils/apiClient";
import {
  ADMIN_SYSTEM_THEME_GET,
  ADMIN_SYSTEM_THEME_SET,
  ADMIN_SETTINGS_LIST,
  ADMIN_SETTINGS_UPDATE,
} from "@/utils/constants";

interface SystemSettings {
  theme: "light" | "dark" | "system";
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    absenceNotifications: boolean;
    hearingReminders: boolean;
    reminderHours: number;
  };
  security: {
    sessionTimeout: number;
    passwordMinLength: number;
    requireStrongPassword: boolean;
    twoFactorEnabled: boolean;
  };
  qrCode: {
    expiryMinutes: number;
    refreshInterval: number;
    enableLocationValidation: boolean;
  };
  general: {
    systemName: string;
    organizationName: string;
    contactEmail: string;
    supportPhone: string;
    timezone: string;
  };
}

const defaultSettings: SystemSettings = {
  theme: "system",
  notifications: {
    emailEnabled: true,
    smsEnabled: false,
    absenceNotifications: true,
    hearingReminders: true,
    reminderHours: 24,
  },
  security: {
    sessionTimeout: 30,
    passwordMinLength: 8,
    requireStrongPassword: true,
    twoFactorEnabled: false,
  },
  qrCode: {
    expiryMinutes: 15,
    refreshInterval: 5,
    enableLocationValidation: true,
  },
  general: {
    systemName: "H4S - Hearing Attendance System",
    organizationName: "Odisha Police",
    contactEmail: "support@h4s.gov.in",
    supportPhone: "+91-1800-123-4567",
    timezone: "Asia/Kolkata",
  },
};

const AdminSystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Fetch theme
      const themeRes = await apiClient.get(ADMIN_SYSTEM_THEME_GET);
      if (themeRes.data.success && themeRes.data.data) {
        setSettings((prev) => ({
          ...prev,
          theme: themeRes.data.data.theme,
        }));
      }

      // Fetch other settings
      const settingsRes = await apiClient.get(ADMIN_SETTINGS_LIST);
      if (settingsRes.data.success && settingsRes.data.data) {
        setSettings((prev) => ({
          ...prev,
          ...settingsRes.data.data,
        }));
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Using default settings - API not connected");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);

      // Save theme
      await apiClient.post(ADMIN_SYSTEM_THEME_SET, { theme: settings.theme });

      // Save other settings
      await apiClient.put(ADMIN_SETTINGS_UPDATE, settings);

      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all settings to defaults?")) {
      setSettings(defaultSettings);
      toast.success("Settings reset to defaults");
    }
  };

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-2">Configure system-wide preferences and parameters</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button size="sm" onClick={handleSaveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="qrcode">
            <QrCode className="h-4 w-4 mr-2" />
            QR Code
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Configuration</CardTitle>
              <CardDescription>Basic system information and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="systemName">System Name</Label>
                  <Input
                    id="systemName"
                    value={settings.general.systemName}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, systemName: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input
                    id="organizationName"
                    value={settings.general.organizationName}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, organizationName: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, contactEmail: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="supportPhone">Support Phone</Label>
                  <Input
                    id="supportPhone"
                    value={settings.general.supportPhone}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, supportPhone: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.general.timezone}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, timezone: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                      <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="theme">Theme Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose light, dark, or system default theme
                    </p>
                  </div>
                  <Select
                    value={settings.theme}
                    onValueChange={(value: "light" | "dark" | "system") =>
                      setSettings({ ...settings, theme: value })
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how and when notifications are sent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, emailEnabled: checked },
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via SMS
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.smsEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, smsEnabled: checked },
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Absence Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Alert when someone marks absent
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.absenceNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, absenceNotifications: checked },
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Hearing Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Send reminders before hearings
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.hearingReminders}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, hearingReminders: checked },
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="grid gap-2">
                  <Label htmlFor="reminderHours">
                    Reminder Time (hours before hearing)
                  </Label>
                  <Input
                    id="reminderHours"
                    type="number"
                    value={settings.notifications.reminderHours}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          reminderHours: parseInt(e.target.value) || 24,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
              <CardDescription>Manage authentication and access control settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          sessionTimeout: parseInt(e.target.value) || 30,
                        },
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="grid gap-2">
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          passwordMinLength: parseInt(e.target.value) || 8,
                        },
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Strong Password</Label>
                    <p className="text-sm text-muted-foreground">
                      Enforce uppercase, lowercase, numbers, and symbols
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.requireStrongPassword}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        security: { ...settings.security, requireStrongPassword: checked },
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for all users
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.twoFactorEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        security: { ...settings.security, twoFactorEnabled: checked },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* QR Code Settings */}
        <TabsContent value="qrcode" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Configuration</CardTitle>
              <CardDescription>Settings for attendance QR code generation and validation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="expiryMinutes">QR Code Expiry (minutes)</Label>
                  <Input
                    id="expiryMinutes"
                    type="number"
                    value={settings.qrCode.expiryMinutes}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        qrCode: {
                          ...settings.qrCode,
                          expiryMinutes: parseInt(e.target.value) || 15,
                        },
                      })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    How long a QR code remains valid after generation
                  </p>
                </div>
                <Separator />
                <div className="grid gap-2">
                  <Label htmlFor="refreshInterval">Auto-Refresh Interval (minutes)</Label>
                  <Input
                    id="refreshInterval"
                    type="number"
                    value={settings.qrCode.refreshInterval}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        qrCode: {
                          ...settings.qrCode,
                          refreshInterval: parseInt(e.target.value) || 5,
                        },
                      })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Automatically generate new QR code after this interval
                  </p>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Location Validation</Label>
                    <p className="text-sm text-muted-foreground">
                      Verify attendee location when scanning QR code
                    </p>
                  </div>
                  <Switch
                    checked={settings.qrCode.enableLocationValidation}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        qrCode: { ...settings.qrCode, enableLocationValidation: checked },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSystemSettings;
