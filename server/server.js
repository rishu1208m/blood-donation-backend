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

app.get("/", (req, res) => res.send("✅ API is running..."));

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB Connected");
        console.log(`✅ Database: ${mongoose.connection.name}`);
    })
    .catch(err => { console.error("❌ MongoDB failed:", err.message); process.exit(1); });

setInterval(async () => {
    try {
        await require("./models/Token").deleteMany({ expiresAt: { $lt: new Date() } });
    } catch (err) { console.error("Token cleanup error:", err.message); }
}, 60 * 60 * 1000);

app.use(require("./middleware/errorHandler"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));