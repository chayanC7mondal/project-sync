import mongoose from "mongoose";
import { genSalt, hash } from "bcrypt";

const authSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["admin", "io", "liaison", "witness"],
    default: "io"
  },
  rank: {
    type: String
  },
  department: {
    type: String
  },
  station: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  themePreference: {
    type: String,
    enum: ["light", "dark", "system"],
    default: "system"
  }
}, { 
  timestamps: true 
});

// Hash password before saving
authSchema.pre("save", async function(next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await genSalt(12);
  this.password = await hash(this.password, salt);
  next();
});

const Auth = mongoose.model("Auth", authSchema);
export default Auth;
