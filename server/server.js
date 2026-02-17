/**
 * Main Server Entry Point
 * Configures and starts the Express server
 */

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const connectDB = require("./config/db");
const weatherRoutes = require("./routes/weather");
const errorHandler = require("./middleware/errorHandler");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Debug logs
console.log("🔐 Environment Variables Check:");
console.log("PORT:", process.env.PORT);
console.log(
  "API_KEY:",
  process.env.OPENWEATHER_API_KEY ? "✅ Loaded" : "❌ Missing"
);
console.log(
  "MONGODB_URI:",
  process.env.MONGODB_URI ? "✅ Loaded" : "❌ Missing"
);
console.log("");

// Initialize app
const app = express();

// Connect MongoDB
connectDB();

// ------------------ MIDDLEWARE ------------------

// ✅ CORS (VERY IMPORTANT)
app.use(
  cors({ 
     origin: [
    "https://wheather-application-8h09.onrender.com"
  ],// React app
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
}

// ------------------ ROUTES ------------------

app.use("/api/weather", weatherRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Weather API is running",
    timestamp: new Date().toISOString(),
  });
});

// Root (development)
app.get("/", (req, res) => {
  res.json({
    message: "Weather API Backend",
    endpoints: {
      health: "/api/health",
      weather: "/api/weather/:city",
    },
  });
});

// ------------------ ERROR HANDLING ------------------

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// ------------------ SERVER START ------------------

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("\n🚀 Server is running!");
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 API: http://localhost:${PORT}`);
  console.log(`💚 Health: http://localhost:${PORT}/api/health\n`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise Rejection:", err);
  process.exit(1);
});
