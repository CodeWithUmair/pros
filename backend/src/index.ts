import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import errorHandler from "./middlewares/errorHandler";
import { PORT, NODE_ENV } from "./constants";
import authRoutes from "./routes/Authentication/authRoutes";
import userRoutes from "./routes/User/userRoutes";

export const frontend_url = "https://stable-pal.vercel.app";
export const local_url = ["http://localhost:3000", "http://localhost:3001"];

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
const corsOptions = {
  origin: [...local_url, frontend_url],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false, // using Authorization header; no cookies
};
app.use(cors(corsOptions));

// Disable caching globally
app.use((_, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

// Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(morgan("dev"));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);

// Health
app.get("/", (_, res) => {
  res.status(200).send("Backend is running fine here ............");
});

// Error handler
app.use(errorHandler);

const port = PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
  console.log(`NODE_ENV: ${NODE_ENV}`);
});
export default app;
