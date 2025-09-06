import mongoose, { Schema } from "mongoose";

export interface ITransaction {
  recipientId: mongoose.Types.ObjectId; // Reference to the recipient user
  amount: number;
}

// Define the ITransactionHistory interface
export type ITransactionHistory = {
  senderId: mongoose.Types.ObjectId; // Reference to the sender user
  transactions: ITransaction[]; // Array of transactions
  currency: { address: string; symbol: string }; // Currency information
  transactionHash: string; // Unique transaction identifier
  timestamp: Date; // Transaction timestamp
  totalAmount: number; // Transaction total amount
  gasFees: number; // Transaction fee
  fee: number; // Protocol fee
  description: string; // Description of the transaction
}

// Define the schema for ITransactionHistory
const transactionSchema = new Schema<ITransactionHistory>({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // Reference to sender user
  transactions: [
    {
      recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      }, // Reference to recipient user
      amount: { type: Number, required: true }, // Transaction amount
    },
  ], // Array of transactions

  currency: {
    address: { type: String, required: true }, // Currency address
    symbol: { type: String, required: true }, // Currency symbol
  },

  transactionHash: { type: String, required: true, unique: true }, // Unique transaction hash

  timestamp: { type: Date, default: Date.now }, // Transaction timestamp

  totalAmount: { type: Number, required: true }, // Total amount in the tx
  gasFees: { type: Number, required: true }, // Transaction fee
  fee: { type: Number, required: true }, // Transaction fee

  description: { type: String, required: true }, // Transaction description
});

// Create the model for the transaction history
export const TransactionHistory = mongoose.model<ITransactionHistory>(
  "TransactionHistory",
  transactionSchema
);
