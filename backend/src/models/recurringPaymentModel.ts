import mongoose, { Document, Schema } from "mongoose";

// 1️⃣ Interface for each Payee
export interface IPayee {
  userId: mongoose.Schema.Types.ObjectId;
  email: string;
  walletAddress: string;
  amount: number;
}

// 2️⃣ Interface for RecurringPayment
export interface IRecurringPayment extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  paymentName: string;  
  stablecoin: string; // e.g., USDC
  sameAmountForAll: boolean;
  defaultAmount: number;
  payees: IPayee[];
  recurrence: 'weekly' | 'monthly';
  nextExecutionDate: Date;
  lastExecutionDate?: Date;
  isActive: boolean;
  createdAt: Date;
}

// 3️⃣ Payee Schema
const payeeSchema = new mongoose.Schema(
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true  },
      email: { type: String, required: true },
      walletAddress: { type: String, required: true },
      amount: { type: Number, required: true, default: 0 }
    },
    { _id: false } // ✅ This disables auto _id generation for each payee
  );

// 4️⃣ Recurring Payment Schema
const recurringPaymentSchema = new Schema<IRecurringPayment>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  paymentName: { type: String, required: true },
  stablecoin: { type: String, required: true }, // USDC, USDT, etc.
  sameAmountForAll: { type: Boolean, default: false },
  defaultAmount: { type: Number, default: 0 }, // required if sameAmountForAll = true
  payees: { type: [payeeSchema], required: true },
  recurrence: {
    type: String,
    enum: ["weekly", "monthly"],
    required: true,
  },
  nextExecutionDate: { type: Date, required: true },
  lastExecutionDate: { type: Date },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

recurringPaymentSchema.set("toJSON", {
    versionKey: false // ✅ removes __v
  });

export const RecurringPayment = mongoose.model<IRecurringPayment>("RecurringPayment", recurringPaymentSchema);
