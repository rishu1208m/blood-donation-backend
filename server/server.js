require("dotenv").config();

const dns = require("dns");
try {
    dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
    console.log("📡 DNS resolvers set to Google + Cloudflare (bypassing local DNS)");
} catch (e) {
    console.warn("Could not override DNS:", e.message);
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.disable("x-powered-by");
app.use(cors({ origin: "*" }));
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(require("./middleware/sanitize"));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
app.set("io", io);

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/requests", require("./routes/requestRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/search", require("./routes/searchRoutes"));
app.use("/api/ai", express.json({ limit: "100kb" }), require("./routes/aiRoutes"));

app.get("/", (req, res) => res.send("✅ API is running..."));

let mongoRetryAttempts = 0;
const MAX_RETRY_DELAY = 60 * 1000;

function connectMongo() {
    mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 8000,
        family: 4,
    })
        .then(() => {
            mongoRetryAttempts = 0;
            console.log("✅ MongoDB Connected");
            console.log(`✅ Database: ${mongoose.connection.name}`);
        })
        .catch(err => {
            mongoRetryAttempts += 1;
            const delay = Math.min(2000 * Math.pow(2, mongoRetryAttempts - 1), MAX_RETRY_DELAY);
            console.error(`❌ MongoDB connection failed (attempt ${mongoRetryAttempts}):`, err.message);
            if (err.message.includes("querySrv") || err.message.includes("ENOTFOUND") || err.message.includes("ECONNREFUSED")) {
                console.error("   ↳ DNS issue detected. Server keeps trying. To fix manually:");
                console.error("     1. Atlas → Connect → choose 'Drivers' → switch driver to 'Node.js < 2.2.12'");
                console.error("     2. Copy the mongodb:// (NOT mongodb+srv://) URI");
                console.error("     3. Replace MONGO_URI in .env, then restart");
            }
            console.error(`   Retrying in ${Math.round(delay / 1000)}s… (server stays up; non-DB endpoints still work)`);
            setTimeout(connectMongo, delay);
        });
}

mongoose.connection.on("disconnected", () => {
    console.warn("⚠️  MongoDB disconnected — attempting to reconnect…");
    setTimeout(connectMongo, 3000);
});

mongoose.connection.on("error", (err) => {
    console.error("⚠️  MongoDB runtime error:", err.message);
});

connectMongo();

setInterval(async () => {
    if (mongoose.connection.readyState !== 1) return;
    try {
        await require("./models/Token").deleteMany({ expiresAt: { $lt: new Date() } });
    } catch (err) { console.error("Token cleanup error:", err.message); }
}, 60 * 60 * 1000);

app.use(require("./middleware/errorHandler"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

process.on("uncaughtException", (err) => console.error("⚠️  uncaughtException:", err.message));
process.on("unhandledRejection", (err) => console.error("⚠️  unhandledRejection:", err?.message || err));
