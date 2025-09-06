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
exports.verifyEmailService = exports.sendVerificationEmailService = exports.resetPasswordService = exports.requestPasswordResetService = exports.refreshAccessTokenService = exports.loginUserService = exports.registerUserService = void 0;
exports._sendInvoiceEmail = _sendInvoiceEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const mailgen_1 = __importDefault(require("mailgen"));
const userModel_1 = __importDefault(require("../../models/userModel"));
const JWTTokenHelper_1 = require("../../utils/JWTTokenHelper");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = require("../../utils/AppError");
const constants_1 = require("../../constants");
const __1 = require("../..");
// ✅ Register Service
const registerUserService = (_a) => __awaiter(void 0, [_a], void 0, function* ({ name, email, password, }) {
    // Check if a user with the given email already exists
    const existingUser = yield userModel_1.default.findOne({ email });
    if (existingUser) {
        if (!existingUser.isVerified) {
            // Generate reset token (valid for 15 minutes)
            const response = yield _sendVerificationEmail(existingUser);
            return response;
        }
        throw new AppError_1.ConflictError("User already exists. Please login.");
    }
    // Create the user if one doesn't exist
    const user = yield userModel_1.default.create({ name, email, password });
    if (!user) {
        throw new AppError_1.ValidationError("User registration failed");
    }
    // Send verification email after successful user creation
    yield _sendVerificationEmail(user);
    return {
        message: "User registered successfully. Please check your email to verify your account.",
        email: user.email,
    };
});
exports.registerUserService = registerUserService;
// ✅ Login Service
const loginUserService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { email, password } = payload;
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    const user = yield userModel_1.default.findOne({ email });
    if (!user) {
        throw new AppError_1.NotFoundError("User not found. Please register first.");
    }
    if (!user.isVerified) {
        throw new AppError_1.ValidationError("User not verified.");
    }
    // Check password validity
    const isPasswordCorrect = yield user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new AppError_1.UnauthorizedError("Invalid email or password.");
    }
    const role = user.email === constants_1.ADMIN_EMAIL ? "Admin" : (_a = user.role) !== null && _a !== void 0 ? _a : "User";
    // Generate tokens
    const accessToken = (0, JWTTokenHelper_1.generateAccessToken)(user._id.toString());
    const refreshToken = (0, JWTTokenHelper_1.generateRefreshToken)(user._id.toString());
    return {
        message: "User Logged in Successfully",
        email: user.email,
        role,
        accessToken: {
            token: accessToken,
            expiry: currentTimeInSeconds + constants_1.ACCESS_TOKEN_DURATION,
        },
        refreshToken: {
            token: refreshToken,
            expiry: currentTimeInSeconds + constants_1.REFRESH_TOKEN_DURATION,
        },
    };
});
exports.loginUserService = loginUserService;
// ✅ Refresh Access Token Service
const refreshAccessTokenService = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    // Verify refresh token
    const decoded = jsonwebtoken_1.default.verify(refreshToken, constants_1.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            throw new AppError_1.UnauthorizedError("Invalid refresh token. Please Login Again."); // Handle invalid refresh token
        }
        return decoded;
    });
    const user = yield userModel_1.default.findById(decoded.id);
    if (!user) {
        throw new AppError_1.NotFoundError("User not found.");
    }
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    // Generate new access token
    const newAccessToken = (0, JWTTokenHelper_1.generateAccessToken)(user._id.toString());
    return {
        message: "Access token refreshed successfully.",
        accessToken: {
            token: newAccessToken,
            expiry: currentTimeInSeconds + constants_1.ACCESS_TOKEN_DURATION,
        },
    };
});
exports.refreshAccessTokenService = refreshAccessTokenService;
// ✅ Request Password Reset Service (Step 1)
const requestPasswordResetService = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield userModel_1.default.findOne({ email });
    if (!user) {
        throw new AppError_1.NotFoundError("User with this email does not exist.");
    }
    // Generate reset token (valid for 15 minutes)
    const resetToken = jsonwebtoken_1.default.sign({ id: user._id }, constants_1.RESET_PASSWORD_SECRET, {
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
                    link: `${__1.frontend_url}/auth/reset-password/?token=${resetToken}`, // Password reset link
                },
            },
            outro: "Need help or have questions? Just reply to this email—we're always happy to help.",
        },
    };
    yield _sendMail(user.email, resetPasswordContent, "Password Reset Request");
    return {
        message: "Password reset link has been sent to your email.",
        resetToken,
    };
});
exports.requestPasswordResetService = requestPasswordResetService;
// ✅ Reset Password Service (Step 2)
const resetPasswordService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { resetToken, newPassword } = payload;
    // Verify resetToken
    const decoded = jsonwebtoken_1.default.verify(resetToken, constants_1.RESET_PASSWORD_SECRET, (err, decoded) => {
        if (err) {
            throw new AppError_1.UnauthorizedError("Invalid reset token."); // Handle invalid reset token
        }
        return decoded;
    });
    const user = yield userModel_1.default.findById(decoded.id);
    if (!user) {
        throw new AppError_1.NotFoundError("User not found.");
    }
    // Check if new password is the same as the old password
    const isOldPassword = yield user.comparePassword(newPassword);
    if (isOldPassword) {
        throw new AppError_1.ValidationError("New password cannot be the same as the old password.");
    }
    user.password = newPassword;
    // Save updated password
    yield user.save();
    return { message: "Password has been reset successfully." };
});
exports.resetPasswordService = resetPasswordService;
const sendVerificationEmailService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = payload;
    const user = yield userModel_1.default.findOne({ email });
    if (!user)
        throw new AppError_1.NotFoundError("User not found.");
    if (user.isVerified) {
        throw new AppError_1.ConflictError("User is already verified.");
    }
    const response = yield _sendVerificationEmail(user);
    return response;
});
exports.sendVerificationEmailService = sendVerificationEmailService;
const verifyEmailService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { verifyEmailToken } = payload;
    const decoded = jsonwebtoken_1.default.verify(verifyEmailToken, constants_1.EMAIL_VERIFICATION_SECRET, (err, decoded) => {
        if (err) {
            throw new AppError_1.UnauthorizedError("Invalid verification token.");
        }
        return decoded;
    });
    // Find the user based on the id from the decoded token
    const user = yield userModel_1.default.findById(decoded.id);
    if (!user) {
        throw new AppError_1.NotFoundError("User not found.");
    }
    if (user.isVerified) {
        throw new AppError_1.ConflictError("User is already verified.");
    }
    // Update the user's verification status
    user.isVerified = true;
    yield user.save();
    return {
        message: "Email has been verified successfully.",
        email: user.email,
    };
});
exports.verifyEmailService = verifyEmailService;
const _sendMail = (recipient, content, subject, cc, // optional carbon-copies
bcc // optional blind-copies
) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Configure email transport settings
        const config = {
            host: constants_1.EMAIL_HOST,
            port: 587,
            auth: {
                user: "apikey",
                pass: constants_1.APP_PASSWORD,
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
        let transporter = nodemailer_1.default.createTransport(config);
        // Initialize the Mailgen mail generator
        let MailGenerator = new mailgen_1.default({
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
            from: constants_1.FROM_EMIAL_ADDRESS,
            to: recipient,
            cc,
            bcc,
            subject: subject,
            html: mail,
        };
        yield transporter.sendMail(message);
        console.log("Email sent successfully");
    }
    catch (error) {
        console.log(error.message);
        throw new AppError_1.ValidationError("Failed to send email. Please try again later.");
    }
});
const _sendVerificationEmail = (user) => __awaiter(void 0, void 0, void 0, function* () {
    // Generate reset token (valid for 15 minutes)
    const emailVerificationToken = jsonwebtoken_1.default.sign({ id: user._id }, constants_1.EMAIL_VERIFICATION_SECRET, {
        expiresIn: "15m",
    });
    console.log("🚀 ~ _sendVerificationEmail ~ emailVerificationToken:", emailVerificationToken);
    const emailVerificationContent = {
        body: {
            name: user.name,
            intro: "Thank you for registering! Please verify your email address by clicking the link below:",
            action: {
                instructions: "Click the button below to verify your email address.",
                button: {
                    color: "#22BC66",
                    text: "Verify Email",
                    link: `${__1.frontend_url}/auth/verify-email/?token=${emailVerificationToken}`,
                },
            },
            outro: "Need help or have questions? Just reply to this email—we're always happy to help.",
        },
    };
    yield _sendMail(user.email, emailVerificationContent, "Email Verification");
    return {
        message: "Verification link has been sent to your email.",
        email: user.email,
        emailVerificationToken,
    };
});
/** Sends an invoice email to a user (and optional cc/bcc). */
function _sendInvoiceEmail(params, isPaidByPayee) {
    return __awaiter(this, void 0, void 0, function* () {
        const { creator, payeeEmail, invoice, cc, bcc, transactionHash } = params;
        const creatorEmail = creator.email;
        const creatorName = creator.name ? creator.name : payeeEmail.split("@")[0];
        const payeeWalletData = yield userModel_1.default.findOne({ email: payeeEmail });
        const payeeName = payeeWalletData
            ? payeeWalletData.name
            : payeeEmail.split("@")[0];
        const invoiceContent = {
            body: {
                name: payeeName,
                intro: `Hi ${payeeName},<br/>${isPaidByPayee
                    ? `Invoice with ID #${invoice._id.toString()} has been paid.`
                    : `Your new invoice #${invoice._id.toString()} is ready to pay.`}`,
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
                            link: `${__1.frontend_url}`,
                        },
                    }
                    : {
                        instructions: "Click the button below to pay your invoice:",
                        button: {
                            color: "#055bf0",
                            text: "Pay Now",
                            link: `${__1.frontend_url}/?invoiceId=${invoice._id}`,
                        },
                    },
                outro: "Need help or have questions? Just reply to this email—we're always happy to help.",
            },
        };
        if (isPaidByPayee) {
            const invoiceContentForCreator = {
                body: {
                    name: creatorName,
                    intro: `Hi ${creatorName},<br/>${isPaidByPayee
                        ? `Invoice with ID #${invoice._id.toString()} has been paid.`
                        : `Your new invoice #${invoice._id.toString()} is ready to pay.`}`,
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
                                link: `${__1.frontend_url}/?invoiceId=${invoice._id}`,
                            },
                        },
                    outro: "Need help or have questions? Just reply to this email—we're always happy to help.",
                },
            };
            yield _sendMail(creatorEmail, invoiceContentForCreator, "Paid Invoice Email", cc, bcc);
            yield _sendMail(payeeEmail, invoiceContent, "Paid Invoice Email", cc, bcc);
            return {
                message: `Invoice sent to payer (${payeeEmail}) and creator (${creatorEmail})  successfully.`,
                email: `${payeeEmail},${creatorEmail}`,
            };
        }
        else {
            yield _sendMail(payeeEmail, invoiceContent, "Invoice Email", cc, bcc);
            return {
                message: `Invoice sent to ${payeeEmail} successfully.`,
                email: payeeEmail,
            };
        }
    });
}
