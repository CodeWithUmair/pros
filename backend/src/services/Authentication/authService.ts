import nodemailer from "nodemailer";
import Mailgen, { Content } from "mailgen";
import User, { IUser } from "../../models/userModel";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/JWTTokenHelper";
import {
  EmailContent,
  EmailVerificationResponse,
  LoginPayload,
  LoginUserResponse,
  RefreshAccessTokenResponse,
  RegisterPayload,
  RegisterUserResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  SendInvoiceEmailTypes,
} from "./DTO";
import jwt from "jsonwebtoken";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../utils/AppError";
import {
  ACCESS_TOKEN_DURATION,
  ADMIN_EMAIL,
  APP_PASSWORD,
  EMAIL_HOST,
  EMAIL_VERIFICATION_SECRET,
  FROM_EMIAL_ADDRESS,
  REFRESH_TOKEN_DURATION,
  REFRESH_TOKEN_SECRET,
  RESET_PASSWORD_SECRET,
} from "../../constants";
import { frontend_url } from "../..";
import { createSolanaWalletService } from "../Wallet/walletService";
import { IInvoice } from "../../models/invoiceModel";

// ✅ Register Service
export const registerUserService = async ({
  name,
  email,
  password,
}: RegisterPayload): Promise<RegisterUserResponse> => {
  // Check if a user with the given email already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    if (!existingUser.isVerified) {
      // Generate reset token (valid for 15 minutes)
      const response = await _sendVerificationEmail(existingUser);

      return response;
    }

    throw new ConflictError("User already exists. Please login.");
  }

  // Create the user if one doesn't exist
  const user = await User.create({ name, email, password });
  if (!user) {
    throw new ValidationError("User registration failed");
  }
  // Send verification email after successful user creation
  await _sendVerificationEmail(user);
  return {
    message:
      "User registered successfully. Please check your email to verify your account.",
    email: user.email,
  };
};

// ✅ Login Service
export const loginUserService = async (
  payload: LoginPayload
): Promise<LoginUserResponse> => {
  const { email, password } = payload;
  const currentTimeInSeconds = Math.floor(Date.now() / 1000);
  const user = await User.findOne({ email });
  if (!user) {
    throw new NotFoundError("User not found. Please register first.");
  }
  if (!user.isVerified) {
    throw new ValidationError("User not verified.");
  }

  // Check password validity
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthorizedError("Invalid email or password.");
  }

  const role = user.email === ADMIN_EMAIL ? "Admin" : user.role ?? "User";

  // Generate tokens
  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  return {
    message: "User Logged in Successfully",
    email: user.email,
    role,
    accessToken: {
      token: accessToken,
      expiry: currentTimeInSeconds + ACCESS_TOKEN_DURATION,
    },
    refreshToken: {
      token: refreshToken,
      expiry: currentTimeInSeconds + REFRESH_TOKEN_DURATION,
    },
  };
};

// ✅ Refresh Access Token Service
export const refreshAccessTokenService = async (
  refreshToken: string
): Promise<RefreshAccessTokenResponse> => {
  // Verify refresh token
  const decoded: any = jwt.verify(
    refreshToken,
    REFRESH_TOKEN_SECRET,
    (err: any, decoded: any) => {
      if (err) {
        throw new UnauthorizedError(
          "Invalid refresh token. Please Login Again."
        ); // Handle invalid refresh token
      }
      return decoded;
    }
  );
  const user = await User.findById(decoded.id);
  if (!user) {
    throw new NotFoundError("User not found.");
  }
  const currentTimeInSeconds = Math.floor(Date.now() / 1000);
  // Generate new access token
  const newAccessToken = generateAccessToken(user._id.toString());

  return {
    message: "Access token refreshed successfully.",
    accessToken: {
      token: newAccessToken,
      expiry: currentTimeInSeconds + ACCESS_TOKEN_DURATION,
    },
  };
};

// ✅ Request Password Reset Service (Step 1)
export const requestPasswordResetService = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new NotFoundError("User with this email does not exist.");
  }

  // Generate reset token (valid for 15 minutes)
  const resetToken = jwt.sign({ id: user._id }, RESET_PASSWORD_SECRET, {
    expiresIn: "15m",
  });

  let resetPasswordContent = {
    body: {
      name: user.name,
      intro: `We received a request to reset your password. Please click the link below to reset your password.`,
      action: {
        instructions: `To reset your password, click the button below. If you didn’t request a password reset, you can safely ignore this email.`,
        button: {
          color: "#055bf0",
          text: "Reset Password",
          link: `${frontend_url}/auth/reset-password/?token=${resetToken}`, // Password reset link
        },
      },
      outro:
        "Need help or have questions? Just reply to this email—we're always happy to help.",
    },
  };

  await _sendMail(user.email, resetPasswordContent, "Password Reset Request");

  return {
    message: "Password reset link has been sent to your email.",
    resetToken,
  };
};

// ✅ Reset Password Service (Step 2)
export const resetPasswordService = async (
  payload: ResetPasswordPayload
): Promise<ResetPasswordResponse> => {
  const { resetToken, newPassword } = payload;

  // Verify resetToken
  const decoded: any = jwt.verify(
    resetToken,
    RESET_PASSWORD_SECRET,
    (err: any, decoded: any) => {
      if (err) {
        throw new UnauthorizedError("Invalid reset token."); // Handle invalid reset token
      }
      return decoded;
    }
  );
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new NotFoundError("User not found.");
  }
  // Check if new password is the same as the old password
  const isOldPassword = await user.comparePassword(newPassword);
  if (isOldPassword) {
    throw new ValidationError(
      "New password cannot be the same as the old password."
    );
  }

  user.password = newPassword;

  // Save updated password
  await user.save();

  return { message: "Password has been reset successfully." };
};

export const sendVerificationEmailService = async (payload: {
  email: string;
}): Promise<RegisterUserResponse> => {
  const { email } = payload;
  const user = await User.findOne({ email });
  if (!user) throw new NotFoundError("User not found.");
  if (user.isVerified) {
    throw new ConflictError("User is already verified.");
  }
  const response = await _sendVerificationEmail(user);
  return response;
};

export const verifyEmailService = async (payload: {
  verifyEmailToken: string;
}): Promise<EmailVerificationResponse> => {
  const { verifyEmailToken } = payload;

  const decoded: any = jwt.verify(
    verifyEmailToken,
    EMAIL_VERIFICATION_SECRET,
    (err: any, decoded: any) => {
      if (err) {
        throw new UnauthorizedError("Invalid verification token.");
      }
      return decoded;
    }
  );

  // Find the user based on the id from the decoded token
  const user = await User.findById(decoded.id);
  if (!user) {
    throw new NotFoundError("User not found.");
  }

  if (user.isVerified) {
    throw new ConflictError("User is already verified.");
  }

  // Update the user's verification status
  user.isVerified = true;
  await user.save();
  const response = await createSolanaWalletService(user.id);

  return {
    message: "Email has been verified successfully.",
    email: user.email,
  };
};

const _sendMail = async (
  recipient: string,
  content: Content,
  subject: string,
  cc?: string[], // optional carbon-copies
  bcc?: string[] // optional blind-copies
): Promise<void> => {
  try {
    // Configure email transport settings
    const config = {
      host: EMAIL_HOST,
      port: 587,
      auth: {
        user: "apikey",
        pass: APP_PASSWORD,
      },
    };

    //TODO:SOULD BE ADDED VALID ONES
    // const config = {
    //   host: EMAIL_HOST,
    //   auth: {
    //     user: "uf80902@gmail.com",     // your Gmail address
    //     pass: APP_PASSWORD,  // 16-char App Password (not your Gmail password)
    //   },
    // };

    // Create the transporter using nodemailer
    let transporter = nodemailer.createTransport(config);

    // Initialize the Mailgen mail generator
    let MailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "Stable Pal",
        link: "https://stablepal.io/",
      },
    });

    // Generate the HTML content of the email
    let mail = MailGenerator.generate(content);

    // Prepare the message to be sent
    let message = {
      // from: "berlinda@annologic.com",
      from: FROM_EMIAL_ADDRESS,
      to: recipient,
      cc,
      bcc,
      subject: subject,
      html: mail,
    };

    await transporter.sendMail(message);
    console.log("Email sent successfully");
  } catch (error: any) {
    console.log(error.message);
    throw new ValidationError("Failed to send email. Please try again later.");
  }
};

const _sendVerificationEmail = async (user: IUser) => {
  // Generate reset token (valid for 15 minutes)
  const emailVerificationToken = jwt.sign(
    { id: user._id },
    EMAIL_VERIFICATION_SECRET,
    {
      expiresIn: "15m",
    }
  );
  console.log(
    "🚀 ~ _sendVerificationEmail ~ emailVerificationToken:",
    emailVerificationToken
  );

  const emailVerificationContent: Content = {
    body: {
      name: user.name,
      intro:
        "Thank you for registering! Please verify your email address by clicking the link below:",
      action: {
        instructions: "Click the button below to verify your email address.",
        button: {
          color: "#22BC66",
          text: "Verify Email",
          link: `${frontend_url}/auth/verify-email/?token=${emailVerificationToken}`,
        },
      },
      outro:
        "Need help or have questions? Just reply to this email—we're always happy to help.",
    },
  };

  await _sendMail(user.email, emailVerificationContent, "Email Verification");

  return {
    message: "Verification link has been sent to your email.",
    email: user.email,
    emailVerificationToken,
  };
};

/** Sends an invoice email to a user (and optional cc/bcc). */
export async function _sendInvoiceEmail(
  params: SendInvoiceEmailTypes,
  isPaidByPayee:boolean
) {
  const { creator, payeeEmail, invoice, cc, bcc, transactionHash } = params;

  const creatorEmail = creator.email;
  const creatorName = creator.name ? creator.name : payeeEmail.split("@")[0];

  const payeeWalletData = await User.findOne({ email: payeeEmail });
  const payeeName = payeeWalletData
    ? payeeWalletData.name
    : payeeEmail.split("@")[0];

  const invoiceContent: Content = {
    body: {
      name: payeeName,
      intro: `Hi ${payeeName},<br/>${
        isPaidByPayee
          ? `Invoice with ID #${invoice._id.toString()} has been paid.`
          : `Your new invoice #${invoice._id.toString()} is ready to pay.`
      }`,
      table: {
        data: [
          { item: "Issuer", value: `${creatorName} (${creator.email})` },
          { item: "Invoice", value: `${invoice.invoiceName}` },
          { item: "Description", value: invoice.description || "—" },
          {
            item: "Amount",
            value: `${invoice.lineItem.amount} ${invoice.lineItem.symbol}`,
          },
          { item: "Status", value: invoice.status },
          { item: "Transaction Hash", value: invoice.status },
        ],
        columns: { customWidth: { item: "30%", value: "70%" } },
      },
      action: isPaidByPayee
        ? {
            instructions: "Click the button below to check invoice:",
            button: {
              color: "#055bf0",
              text: "Check Invoice",
              link: `${frontend_url}`,
            },
          }
        : {
            instructions: "Click the button below to pay your invoice:",
            button: {
              color: "#055bf0",
              text: "Pay Now",
              link: `${frontend_url}/?invoiceId=${invoice._id}`,
            },
          },
      outro:
        "Need help or have questions? Just reply to this email—we're always happy to help.",
    },
  };

  if (isPaidByPayee) {
    const invoiceContentForCreator: Content = {
      body: {
        name: creatorName,
        intro: `Hi ${creatorName},<br/>${
          isPaidByPayee
            ? `Invoice with ID #${invoice._id.toString()} has been paid.`
            : `Your new invoice #${invoice._id.toString()} is ready to pay.`
        }`,
        table: {
          data: [
            { item: "Issuer", value: `${creatorName} (${creator.email})` },
            { item: "Invoice", value: `${invoice.invoiceName}` },
            { item: "Description", value: invoice.description || "—" },
            {
              item: "Amount",
              value: `${invoice.lineItem.amount} ${invoice.lineItem.symbol}`,
            },
            { item: "Status", value: invoice.status },

            {
              item: "Transaction Hash",
              value: transactionHash ? transactionHash : "tx-hash not found",
            },
          ],
          columns: { customWidth: { item: "30%", value: "70%" } },
        },
        action: isPaidByPayee
          ? []
          : {
              instructions: "Click the button below to pay your invoice:",
              button: {
                color: "#055bf0",
                text: "Pay Now",
                link: `${frontend_url}/?invoiceId=${invoice._id}`,
              },
            },
        outro:
          "Need help or have questions? Just reply to this email—we're always happy to help.",
      },
    };
    await _sendMail(
      creatorEmail,
      invoiceContentForCreator,
      "Paid Invoice Email",
      cc,
      bcc
    );
    await _sendMail(payeeEmail, invoiceContent, "Paid Invoice Email", cc, bcc);

    return {
      message: `Invoice sent to payer (${payeeEmail}) and creator (${creatorEmail})  successfully.`,
      email: `${payeeEmail},${creatorEmail}`,
    };
  } else {
    await _sendMail(payeeEmail, invoiceContent, "Invoice Email", cc, bcc);
    return {
      message: `Invoice sent to ${payeeEmail} successfully.`,
      email: payeeEmail,
    };
  }
}
