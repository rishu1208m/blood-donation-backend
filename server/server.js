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

// Body parser
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// Security
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

app.disable("x-powered-by");

// ✅ FIXED CORS (VERY IMPORTANT)
app.use(cors({
    origin: "*",   // allow all (for now)
}));

// Logging
app.use(morgan("dev"));

// Rate limit
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
}));

// Sanitize
app.use(require("./middleware/sanitize"));


// ================= SOCKET =================

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

app.set("io", io);


// ================= ROUTES =================

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/request", require("./routes/requestRoutes"));
app.use("/api/search", require("./routes/searchRoutes"));


// ✅ Optional test route
app.get("/", (req, res) => {
    res.send("API is running...");
});


// ================= DATABASE =================

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));


// ================= TOKEN CLEANUP =================

setInterval(async () => {
    await require("./models/Token").deleteMany({
        expiresAt: { $lt: new Date() }
    });
}, 60 * 60 * 1000);


// ================= ERROR =================

app.use(require("./middleware/errorHandler"));


// ================= START =================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});