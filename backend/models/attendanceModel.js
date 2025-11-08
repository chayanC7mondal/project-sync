import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Case",
    required: true
  },
  officer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auth",
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
    enum: ["present", "absent", "late", "on-leave", "exempted"],
    default: "absent"
  },
  arrivalTime: {
    type: Date
  },
  departureTime: {
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
  }
}, { 
  timestamps: true 
});

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
