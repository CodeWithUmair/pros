import { IInvoice } from "../../models/invoiceModel";
import { IUser } from "../../models/userModel";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ResetPasswordPayload {
  resetToken: string;
  newPassword: string;
}

export interface RegisterUserResponse {
  message: string;
  email: string;
}

export interface EmailVerificationResponse {
  message: string;
  email: string;
}

export interface LoginUserResponse {
  message: string;
  email: string;
  role: "User" | "Admin";
  accessToken: {
    token: string;
    expiry: number;
  };
  refreshToken: {
    token: string;
    expiry: number;
  };
}

export interface RefreshAccessTokenResponse {
  message: string;
  accessToken: { token: string; expiry: number };
}

export interface ResetPasswordResponse {
  message: string;
}

interface EmailActionButton {
  color: string;
  text: string;
  link: string;
}

interface EmailAction {
  instructions: string;
  button: EmailActionButton;
}

interface EmailBody {
  name: string;
  intro: string;
  action: EmailAction;
  outro: string;
}

export interface EmailContent {
  body: EmailBody;
}
export type SendInvoiceEmailTypes = {
  creator: IUser;
  invoice: IInvoice;
  payeeEmail: string;
  transactionHash: string | null;
  cc?: string[]; // optional carbon-copies
  bcc?: string[]; // optional blind-copies
};
