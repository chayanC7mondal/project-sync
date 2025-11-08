import mongoose from "mongoose";

const witnessSchema = new mongoose.Schema({
  witnessId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  fatherName: {
    type: String
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  alternatePhone: {
    type: String
  },
  email: {
    type: String
  },
  address: {
    type: String
  },
  cases: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Case"
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

const Witness = mongoose.model("Witness", witnessSchema);
export default Witness;
