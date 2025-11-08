// Central export point for all database models
// Import all models
import Auth from "./authModel.js";
import Case from "./caseModel.js";
import Witness from "./witnessModel.js";
import Attendance from "./attendanceModel.js";
import Notification from "./notificationModel.js";
import Settings, { initializeDefaultSettings } from "./settingsModel.js";
import ActivityLog from "./activityLogModel.js";

// Export all models
export {
  Auth,
  Case,
  Witness,
  Attendance,
  Notification,
  Settings,
  ActivityLog,
  initializeDefaultSettings
};

// Default export as an object for convenience
export default {
  Auth,
  Case,
  Witness,
  Attendance,
  Notification,
  Settings,
  ActivityLog,
  initializeDefaultSettings
};
