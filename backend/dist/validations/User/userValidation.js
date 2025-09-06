"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendFundsSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.sendFundsSchema = joi_1.default.object({
    recipientEmail: joi_1.default.string().email({ minDomainSegments: 2 }).messages({
        "string.empty": "Email is required.",
        "string.email": "Must be a valid email address.",
    }),
    tokenAddress: joi_1.default.string().required().messages({
        "string.empty": "Token address is required.",
    }),
    amount: joi_1.default.number().required().messages({
        "number.base": "Amount must be a number.",
        "any.required": "Amount is required.",
    }),
    description: joi_1.default.string().required().max(100).messages({
        "string.empty": "Description is required.",
        "string.max": "Description must be at most 100 characters long.",
    }),
});
