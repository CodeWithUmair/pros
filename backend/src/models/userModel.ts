import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "User" | "Admin";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId; // Explicitly define _id
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  role: UserRole;
  signupDate: Date;
  totalBalance: number;
  totalTransactions: number;
  solanaWallet?: {
    address: string;
    encryptedPrivateKey: string;
  };
  comparePassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["User", "Admin"], default: "User" },
    signupDate: { type: Date, required: true, default: Date.now() },
    totalBalance: { type: Number, required: true, default: 0 },
    totalTransactions: { type: Number, required: true, default: 0 },
    solanaWallet: {
      address: { type: String },
      encryptedPrivateKey: { type: String }, // Securely store the private key
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Fix: Ensure correct `this` binding
userSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;
