import jwt from "jsonwebtoken";
import {
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
    EMAIL_VERIFICATION_SECRET,
    RESET_PASSWORD_SECRET,
    ACCESS_TOKEN_DURATION,
    REFRESH_TOKEN_DURATION,
    EMAIL_VERIFICATION_TOKEN_DURATION,
    RESET_PASSWORD_TOKEN_DURATION
} from "../constants";

export const generateAccessToken = (userId: string) =>
    jwt.sign({ id: userId }, ACCESS_TOKEN_SECRET, { expiresIn: `${ACCESS_TOKEN_DURATION}s` });

export const generateRefreshToken = (userId: string) =>
    jwt.sign({ id: userId }, REFRESH_TOKEN_SECRET, { expiresIn: `${REFRESH_TOKEN_DURATION}s` });

export const generateEmailVerificationToken = (userId: string) =>
    jwt.sign({ id: userId }, EMAIL_VERIFICATION_SECRET, { expiresIn: `${EMAIL_VERIFICATION_TOKEN_DURATION}s` });

export const generateResetPasswordToken = (userId: string) =>
    jwt.sign({ id: userId }, RESET_PASSWORD_SECRET, { expiresIn: `${RESET_PASSWORD_TOKEN_DURATION}s` });

export const verifyEmailToken = (token: string) =>
    jwt.verify(token, EMAIL_VERIFICATION_SECRET) as { id: string };

export const verifyResetToken = (token: string) =>
    jwt.verify(token, RESET_PASSWORD_SECRET) as { id: string };

export const verifyRefreshToken = (token: string) =>
    jwt.verify(token, REFRESH_TOKEN_SECRET) as { id: string };
