import express, { type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { servicePublicRouter, serviceAdminRouter } from "./routes/services.js";
import { bookingRouter } from "./routes/bookings.js";
import { adminRouter } from "./routes/admin.js";
import { requireAdminAuth } from "./middleware/auth.js";

const app = express();

// ── Global middleware ─────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env["CLIENT_ORIGIN"] ?? "http://localhost:3000",
    credentials: true,
  })
);

app.get("/", (_req: Request, res: Response) => {
  res.json({ success: true, message: "ServiceFlow API is running." });
});

// ── Routes ────────────────────────────────────────────────────────────────────

app.use("/api/auth", authRouter);

app.use("/api/services", servicePublicRouter);

app.use("/api/bookings", bookingRouter);


app.use("/api/admin", adminRouter);

app.use("/api/admin/services", requireAdminAuth, serviceAdminRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = Number(process.env["PORT"] ?? 2001);

app.listen(PORT, () => {
  console.log(`Server running → http://localhost:${PORT}`);
});

export { app };
