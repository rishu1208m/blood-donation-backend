require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

const http = require("http");
const { Server } = require("socket.io");

const app = express();

// ================= MIDDLEWARE =================

// 🔥 BODY PARSER (MUST BE FIRST)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// 🔐 Security headers
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

app.disable("x-powered-by");

// 🌐 CORS
app.use(cors({
    origin: "http://localhost:3000"
}));

// 🧼 Sanitize input
app.use(require("./middleware/sanitize"));

// 🔍 Logging
app.use(morgan("dev"));

// 🚫 Rate limiting
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
}));

// ================= SOCKET =================
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

app.set("io", io);

// ================= ROUTES =================

// ✅ REMOVE duplicate (you had it twice)
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/request", require("./routes/requestRoutes"));
app.use("/api/search", require("./routes/searchRoutes"));

// ================= DB =================
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// 🔥 Token cleanup
setInterval(async () => {
    await require("./models/Token").deleteMany({
        expiresAt: { $lt: new Date() }
    });
}, 60 * 60 * 1000);

// ================= ERROR =================
app.use(require("./middleware/errorHandler"));

// ================= START =================
server.listen(5000, () => console.log("Server running on port 5000"));