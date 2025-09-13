
require("dotenv").config();

export const IS_TEST_MODE = false;

export const PORT = process.env.PORT as string;
export const FROM_EMIAL_ADDRESS = process.env.FROM_EMIAL_ADDRESS as string;
export const APP_PASSWORD = process.env.APP_PASSWORD as string;
export const EMAIL_HOST = process.env.EMAIL_HOST as string;
export const NODE_ENV = process.env.NODE_ENV as string;
export const MONGO_URI = process.env.MONGO_URI as string;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
export const RESET_PASSWORD_SECRET = process.env
  .RESET_PASSWORD_SECRET as string;
export const EMAIL_VERIFICATION_SECRET = process.env
  .EMAIL_VERIFICATION_SECRET as string;
export const ADMIN_EMAIL = "codewithumair867@gmail.com";

export const RESEND_API_KEY = process.env.RESEND_API_KEY as string;
export const FROM_EMAIL = process.env.FROM_EMAIL as string;
export const FRONTEND_URL = process.env.FRONTEND_URL as string;
export const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;

export const ACCESS_TOKEN_DURATION = 15 * 60; // 15 minutes (recommend shorter for access)
export const REFRESH_TOKEN_DURATION = 7 * 24 * 60 * 60; // 7 days
export const EMAIL_VERIFICATION_TOKEN_DURATION = 24 * 60 * 60; // 1 day
export const RESET_PASSWORD_TOKEN_DURATION = 60 * 60; // 1 hour