"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionHistory = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Define the schema for ITransactionHistory
const transactionSchema = new mongoose_1.Schema({
    senderId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }, // Reference to sender user
    transactions: [
        {
            recipientId: {
                type: mongoose_1.default.Schema.Types.ObjectId,
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
exports.TransactionHistory = mongoose_1.default.model("TransactionHistory", transactionSchema);
