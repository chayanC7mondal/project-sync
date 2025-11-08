import mongoose from "mongoose";

const absenceReasonSchema = new mongoose.Schema({
  hearingSessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HearingSession",
    required: true
  },
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Case",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auth",
    required: true
  },
  userType: {
    type: String,
    enum: ["officer", "witness"],
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  reasonCategory: {
    type: String,
    enum: ["medical", "emergency", "personal", "official", "other"],
    default: "other"
  },
  supportingDocuments: [{
    type: String
  }],
  status: {
    type: String,
    enum: ["pending", "acknowledged", "approved", "rejected"],
    default: "pending"
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  respondedAt: {
    type: Date
  }
}, { 
  timestamps: true 
});

absenceReasonSchema.index({ hearingSessionId: 1 });
absenceReasonSchema.index({ caseId: 1 });
absenceReasonSchema.index({ userId: 1 });

const AbsenceReason = mongoose.model("AbsenceReason", absenceReasonSchema);
export default AbsenceReason;
