import mongoose from "mongoose";

const hearingSessionSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: true,
    },
    hearingDate: {
      type: Date,
      required: true,
    },
    hearingTime: {
      type: String,
      required: true,
    },
    qrCode: {
      type: String,
      required: true,
      unique: true,
    },
    qrCodeData: {
      type: String,
      required: true,
    },
    manualCode: {
      type: String,
      required: true,
      unique: true,
    },
    courtName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
      default: "scheduled",
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    weeklyReminderSent: {
      type: Boolean,
      default: false,
    },
    dayOfReminderSent: {
      type: Boolean,
      default: false,
    },
    postNotificationsSent: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

hearingSessionSchema.index({ caseId: 1, hearingDate: 1 });
hearingSessionSchema.index({ qrCode: 1 });
hearingSessionSchema.index({ hearingDate: 1 });

const HearingSession = mongoose.model("HearingSession", hearingSessionSchema);
export default HearingSession;
