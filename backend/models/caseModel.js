import mongoose from "mongoose";

const caseSchema = new mongoose.Schema({
  caseId: {
    type: String,
    required: true,
    unique: true
  },
  firNumber: {
    type: String,
    required: true
  },
  firDate: {
    type: Date,
    required: true
  },
  policeStation: {
    type: String,
    required: true
  },
  sections: [String],
  courtName: {
    type: String,
    required: true
  },
  courtNumber: {
    type: String
  },
  judge: {
    type: String
  },
  investigatingOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auth",
    required: true
  },
  liaisonOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auth"
  },
  witnesses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Witness"
  }],
  nextHearingDate: {
    type: Date,
    required: true
  },
  hearingTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "ongoing", "disposed", "adjourned"],
    default: "pending"
  },
  attendanceStatus: {
    type: String,
    enum: ["present", "absent", "late", "not-marked"],
    default: "not-marked"
  },
  remarks: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

const Case = mongoose.model("Case", caseSchema);
export default Case;
