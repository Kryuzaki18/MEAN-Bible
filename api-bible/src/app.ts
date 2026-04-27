import express from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import { rateLimit } from "express-rate-limit";
import bibleRoutes from "./routes/bibleRoutes";

const app = express();

// 1. Security Headers (Industry standard)
app.use(helmet());

// 2. Prevent HTTP Parameter Pollution
app.use(hpp());

// 3. Rate Limiting (Prevent Brute Force/DoS)
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again after 1 minute",
});

// Apply rate limiter to all API routes
app.use("/api", limiter);

const corsOptions = {
  origin:
    process.env.NODE_ENV === "development"
      ? "http://localhost:1111"
      : "https://my-one-bible.netlify.app",
  methods: ["GET"], // Allow only these methods
};

app.use(cors(corsOptions));

app.use(express.json());
app.use("/api/bible", bibleRoutes);

export default app;
