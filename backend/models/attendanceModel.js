import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
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
    refPath: "userType",
    required: true
  },
  userType: {
    type: String,
    enum: ["officer", "witness"],
    required: true
  },
  userModel: {
    type: String,
    enum: ["Auth", "Witness"],
    required: true
  },
  hearingDate: {
    type: Date,
    required: true
  },
  hearingTime: {
    type: String,
    required: true
  },
  courtName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["present", "absent", "late", "on-leave", "exempted", "not-marked"],
    default: "not-marked"
  },
  arrivalTime: {
    type: Date
  },
  departureTime: {
    type: Date
  },
  markedViaQR: {
    type: Boolean,
    default: false
  },
  qrScannedAt: {
    type: Date
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  remarks: {
    type: String
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auth"
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auth"
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  absenceNotificationSent: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

attendanceSchema.index({ hearingSessionId: 1 });
attendanceSchema.index({ caseId: 1 });
attendanceSchema.index({ userId: 1 });
attendanceSchema.index({ hearingDate: 1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
