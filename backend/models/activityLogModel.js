import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auth",
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      "login",
      "logout",
      "create",
      "update",
      "delete",
      "view",
      "mark_attendance",
      "verify_attendance",
      "send_notification",
      "change_password"
    ]
  },
  entityType: {
    type: String,
    enum: ["case", "attendance", "witness", "notification", "user", "settings"]
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  description: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String
  },
  status: {
    type: String,
    enum: ["success", "failed"],
    default: "success"
  }
}, { 
  timestamps: true 
});

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
export default ActivityLog;
