import mongoose, { Document, Schema } from "mongoose";
import {
  ILineItem, // export this from your invoiceModel
  lineItemSchema,
} from "./invoiceModel";

/* ─────────────────────────  INTERFACE  ────────────────────────── */

export interface IRecurringInvoice extends Document {
  invoiceName: string;
  recurrence: "weekly" | "monthly";
  nextExecutionDate: Date;
  lastExecutionDate?: Date;
  isActive: boolean;
  createdAt: Date;
  creatorId: mongoose.Types.ObjectId; // issuer
  payeeEmail: string; // single recipient
  lineItem: ILineItem; // product / service row
  description: string;
}

/* ───────────────────────────  SCHEMA  ─────────────────────────── */

const recurringInvoiceSchema = new Schema<IRecurringInvoice>({
  invoiceName: { type: String, required: true },
  recurrence: {
    type: String,
    enum: ["weekly", "monthly"],
    required: true,
  },

  nextExecutionDate: { type: Date, required: true },
  lastExecutionDate: { type: Date },

  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },

  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  payeeEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },

  lineItem: { type: lineItemSchema, required: true },

  description: { type: String, default: "" },
});

export const RecurringInvoice = mongoose.model<IRecurringInvoice>(
  "RecurringInvoice",
  recurringInvoiceSchema
);
