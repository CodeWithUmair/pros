import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db";
import errorHandler from "./middlewares/errorHandler";
import { PORT } from "./constants";
import cron from "node-cron";
import authRoutes from "./routes/Authentication/authRoutes";
import walletRoutes from "./routes/Wallet/walletRoutes";
import userRoutes from "./routes/User/userRoutes";
import invoiceRoutes from "./routes/Invoice/invoiceRoutes";
import recurringPayment from "./routes/RecurringPayments/recurringPaymentRoutes";
import recurringInvoiceRoutes from "./routes/RecurringInvoice/recurringInvoiceRoutes";
import onrampRoutes from "./routes/Onramp/onrampRoutes";
import { executeRecurringPayments } from "./cronjobs/recurringPayments";
import { executeRecurringInvoicesCron } from "./cronjobs/recurringInvoices";
import adminRoutes from "./routes/Admin/adminRoutes";

//TODO:add frontedn url live
export const frontend_url = "https://stable-pal.vercel.app";
export const admin_url = "https://admin-stable-pal.vercel.app";
export const local_url = ["http://localhost:3000", "http://localhost:3001"];

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
const corsOptions = {
  origin: [
    frontend_url,
    admin_url,
    ...local_url
  ],
  // credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Disable caching globally
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

// Adjust Helmet settings
app.use(
  helmet({
    crossOriginResourcePolicy: false, // Allow cross-origin resources
    crossOriginEmbedderPolicy: false,
  })
);
app.use(morgan("dev"));

// Database Connection
connectDB();

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/recurring-payments", recurringPayment);
app.use("/api/v1/wallet", walletRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/invoice", invoiceRoutes);
app.use("/api/v1/recurring-invoice", recurringInvoiceRoutes);
app.use("/api/v1/onramp", onrampRoutes);

// ⬇️ Admin routes
app.use("/api/v1/admin", adminRoutes);

// Global Error Handling Middleware
app.use(errorHandler);

app.get("/", (_, res) => {
  res.status(200);
  console.log("🚀 ~ app.get ~ Backend is running fine here:");
  res.send("Backend is running fine here ............");
});

// Run every 1 minute (adjust as needed)
cron.schedule("*/1 * * * *", async () => {
  console.log("⏰ Cron Job Started - Checking Recurring Payments");
  await executeRecurringPayments();
});

// Run every 1 minute (adjust as needed)
cron.schedule("*/1 * * * *", async () => {
  console.log("⏰ Cron Job Started - Checking Recurring Invoices");
  await executeRecurringInvoicesCron();
});


const port = PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});
export default app;
