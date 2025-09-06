import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./userModel";

export enum InvoiceStatus {
  Pending = "pending",
  Paid = "paid",
}

export interface ILineItem {
  amount: number;
  currency: string;
  symbol: string;
}

export interface IInvoice extends Document {
  _id: mongoose.Types.ObjectId;
  invoiceName: string;
  creatorId: mongoose.Types.ObjectId | IUser; // issuer
  payeeEmail: string; // recipient
  lineItem: ILineItem;
  status: InvoiceStatus;
  description: string;
  paidAt?: Date;
}

export const lineItemSchema = new Schema<ILineItem>(
  {
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true },
    symbol: { type: String, required: true },
  },
  { _id: false }
);

// --- Invoice schema -------------------------------------------------------
const invoiceSchema = new Schema<IInvoice>(
  {
    creatorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    invoiceName: { type: String,required: true },
    payeeEmail: { type: String, required: true },

    lineItem: { type: lineItemSchema, required: true },

    status: {
      type: String,
      enum: Object.values(InvoiceStatus),
      default: InvoiceStatus.Pending,
      required: true,
    },

    description: { type: String, default: "" },

    paidAt: { type: Date },
  },
  { timestamps: true }
);

const Invoice = mongoose.model<IInvoice>("Invoice", invoiceSchema);
export default Invoice;
