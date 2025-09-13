import axios from "axios";
import { RESEND_API_KEY, FROM_EMAIL } from "../constants";

const RESEND_URL = "https://api.resend.com/emails";

export async function sendVerificationEmail(to: string, verificationUrl: string) {
    try {
        const body = {
            from: FROM_EMAIL,
            to,
            subject: "Verify your email",
            html: `<p>Click to verify your email</p>
             <p><a href="${verificationUrl}">Verify Email</a></p>
             <p>If you didn't request this, ignore.</p>`,
        };

        const res = await axios.post(RESEND_URL, body, {
            headers: {
                Authorization: `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
        });

        return res.data; // return API response if needed
    } catch (error: any) {
        if (error.response) {
            throw new Error(
                `Failed to send verification email: ${error.response.status} ${JSON.stringify(error.response.data)}`
            );
        }
        throw new Error(`Failed to send verification email: ${error.message}`);
    }
}

export async function sendResetPasswordEmail(to: string, resetUrl: string) {
    try {
        const body = {
            from: FROM_EMAIL,
            to,
            subject: "Reset your password",
            html: `<p>Reset your password by clicking below:</p>
             <p><a href="${resetUrl}">Reset Password</a></p>`,
        };

        const res = await axios.post(RESEND_URL, body, {
            headers: {
                Authorization: `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
        });

        return res.data; // return API response if needed
    } catch (error: any) {
        if (error.response) {
            throw new Error(
                `Failed to send reset password email: ${error.response.status} ${JSON.stringify(error.response.data)}`
            );
        }
        throw new Error(`Failed to send reset password email: ${error.message}`);
    }
}
