"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = sendVerificationEmail;
exports.sendResetPasswordEmail = sendResetPasswordEmail;
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("../constants");
const RESEND_URL = "https://api.resend.com/emails";
function sendVerificationEmail(to, verificationUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = {
                from: constants_1.FROM_EMAIL,
                to,
                subject: "Verify your email",
                html: `<p>Click to verify your email</p>
             <p><a href="${verificationUrl}">Verify Email</a></p>
             <p>If you didn't request this, ignore.</p>`,
            };
            const res = yield axios_1.default.post(RESEND_URL, body, {
                headers: {
                    Authorization: `Bearer ${constants_1.RESEND_API_KEY}`,
                    "Content-Type": "application/json",
                },
            });
            return res.data; // return API response if needed
        }
        catch (error) {
            if (error.response) {
                throw new Error(`Failed to send verification email: ${error.response.status} ${JSON.stringify(error.response.data)}`);
            }
            throw new Error(`Failed to send verification email: ${error.message}`);
        }
    });
}
function sendResetPasswordEmail(to, resetUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = {
                from: constants_1.FROM_EMAIL,
                to,
                subject: "Reset your password",
                html: `<p>Reset your password by clicking below:</p>
             <p><a href="${resetUrl}">Reset Password</a></p>`,
            };
            const res = yield axios_1.default.post(RESEND_URL, body, {
                headers: {
                    Authorization: `Bearer ${constants_1.RESEND_API_KEY}`,
                    "Content-Type": "application/json",
                },
            });
            return res.data; // return API response if needed
        }
        catch (error) {
            if (error.response) {
                throw new Error(`Failed to send reset password email: ${error.response.status} ${JSON.stringify(error.response.data)}`);
            }
            throw new Error(`Failed to send reset password email: ${error.message}`);
        }
    });
}
