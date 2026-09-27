```js
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "change-this-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 8 * 60 * 60 * 1000
    }
  })
);

// =========================
// BASIC ROUTES
// =========================

app.get("/", (req, res) => {
  res.json({
    success: true,
    name: "UPI-Pay API",
    message: "UPI-Pay backend is running"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    service: "upi-pay-backend",
    timestamp: new Date().toISOString()
  });
});

// =========================
// TEMPORARY AUTH TEST ROUTES
// =========================

app.post("/api/auth/test-register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters."
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    res.json({
      success: true,
      message: "Registration test successful.",
      user: {
        username,
        passwordHashCreated: Boolean(passwordHash)
      }
    });
  } catch (error) {
    console.error("Test registration error:", error);

    res.status(500).json({
      success: false,
      message: "Server error."
    });
  }
});

// =========================
// 404 HANDLER
// =========================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found."
  });
});

// =========================
// ERROR HANDLER
// =========================

app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error."
  });
});

// =========================
// START SERVER
// =========================

app.listen(PORT, () => {
  console.log(`UPI-Pay API running on port ${PORT}`);
});
```
