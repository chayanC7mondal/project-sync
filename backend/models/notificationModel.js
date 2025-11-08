import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auth",
    required: true
  },
  type: {
    type: String,
    enum: ["reminder", "alert", "success", "warning", "info"],
    required: true
  },
  priority: {
    type: String,
    enum: ["low", "normal", "high", "urgent"],
    default: "normal"
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedEntityType: {
    type: String,
    enum: ["case", "attendance", "witness", "hearing", "system"]
  },
  relatedEntityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
