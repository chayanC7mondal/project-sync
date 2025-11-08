import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import apiClient from "@/utils/apiClient";
import { SETTINGS_GET, SETTINGS_UPDATE } from "@/utils/constants";

const Settings = () => {
  // Using default values - will be replaced with API data when backend is ready
  const [formData, setFormData] = useState({
    name: "Admin User",
    employeeId: "EMP001",
    email: "admin@odishapolice.gov.in",
    phone: "+91 9876543210",
    emailNotifications: true,
    smsNotifications: true,
    courtReminders: true,
  });
  const [loading, setLoading] = useState(false);

  // Fetch a specific setting by key - API function (uncomment when backend is ready)
  const fetchSetting = async (key) => {
    try {
      const response = await apiClient.get(SETTINGS_GET(key));
      return response.data;
    } catch (error) {
      console.error(`Error fetching setting ${key}:`, error);
      return null;
    }
  };

  // Update a specific setting by key - API function (uncomment when backend is ready)
  const handleUpdateSetting = async (key, value) => {
    try {
      await apiClient.put(SETTINGS_UPDATE(key), { value });
      toast.success(`${key} updated successfully`);
    } catch (error) {
      toast.error(`Failed to update ${key}`);
      console.error(`Error updating setting ${key}:`, error);
    }
  };

  // Load all settings on mount - API function (uncomment when backend is ready)
  const loadSettings = async () => {
    try {
      setLoading(true);
      // Fetch multiple settings if needed
      const settings = await Promise.all([
        fetchSetting("profile"),
        fetchSetting("notifications"),
      ]);
      
      if (settings[0]) {
        setFormData(prev => ({
          ...prev,
          ...settings[0]
        }));
      }
      
      if (settings[1]) {
        setFormData(prev => ({
          ...prev,
          ...settings[1]
        }));
      }
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  // Save all settings
  const handleSave = async () => {
    try {
      setLoading(true);
      
      // When API is ready, uncomment these lines:
      // await handleUpdateSetting("profile", {
      //   name: formData.name,
      //   employeeId: formData.employeeId,
      //   email: formData.email,
      //   phone: formData.phone,
      // });
      
      // await handleUpdateSetting("notifications", {
      //   emailNotifications: formData.emailNotifications,
      //   smsNotifications: formData.smsNotifications,
      //   courtReminders: formData.courtReminders,
      // });
      
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  // Uncomment this to enable API calls when backend is ready
  // useEffect(() => {
  //   loadSettings();
  // }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and application preferences</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-foreground">Profile Information</CardTitle>
          <CardDescription>Update your personal details and contact information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="Enter your name" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee-id">Employee ID</Label>
              <Input 
                id="employee-id" 
                placeholder="Enter employee ID" 
                value={formData.employeeId}
                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="Enter phone number" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-foreground">Notification Preferences</CardTitle>
          <CardDescription>Choose how you want to receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive alerts via email</p>
            </div>
            <Switch 
              id="email-notifications" 
              checked={formData.emailNotifications}
              onCheckedChange={(checked) => setFormData({...formData, emailNotifications: checked})}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sms-notifications">SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive alerts via SMS</p>
            </div>
            <Switch 
              id="sms-notifications" 
              checked={formData.smsNotifications}
              onCheckedChange={(checked) => setFormData({...formData, smsNotifications: checked})}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="court-reminders">Court Date Reminders</Label>
              <p className="text-sm text-muted-foreground">Get reminders for upcoming hearings</p>
            </div>
            <Switch 
              id="court-reminders" 
              checked={formData.courtReminders}
              onCheckedChange={(checked) => setFormData({...formData, courtReminders: checked})}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-foreground">Security Settings</CardTitle>
          <CardDescription>Manage your password and security preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" placeholder="Enter current password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" placeholder="Enter new password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" placeholder="Confirm new password" />
          </div>
          <Button variant="outline">Change Password</Button>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
