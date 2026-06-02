import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { initializeFirebase } from "./config/firebase";
import authRoutes from "./routes/auth";
import storeRoutes from "./routes/stores";
import productRoutes from "./routes/products";
import productVariantRoutes from "./routes/productVariants";
import orderRoutes from "./routes/orders";
import paymentRoutes from "./routes/payments";
import walletRoutes from "./routes/wallet";
import uploadRoutes from "./routes/upload";
import dashboardRoutes from "./routes/dashboard";
import reviewRoutes from "./routes/reviews";
import adminRoutes from "./routes/admin";

// Initialize Firebase
if (env.otpMode === "production") {
  try {
    initializeFirebase();
    console.log("✓ Firebase initialized successfully");
  } catch (error) {
    console.error("✗ Firebase initialization failed:", error);
  }
}

const app = express();

// Middleware
app.use(cors({
  origin: [env.frontendUrl, env.adminUrl].filter(Boolean),
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api", productRoutes);
app.use("/api", productVariantRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Tap2Buy API running on port ${env.port}`);
});

export default app;
