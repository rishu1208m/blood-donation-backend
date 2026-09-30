🩸 BloodConnect

A full-stack web app that helps people find compatible blood donors quickly in urgent situations.

When someone urgently needs blood, finding a compatible donor fast can be difficult. BloodConnect connects donors with people in need, shows how far each donor is, and uses AI-assisted features to guide users and cut down the time spent searching.

Medical disclaimer: The eligibility guidance in this app is informational only. Whether a person can donate must always be confirmed by a qualified healthcare professional.

✨ Features
Core
Donor registration: donors sign up with their blood group and relevant details
Find donors: search for potential donors based on blood group and requirements
Location-based results: see how far a donor is and quickly spot nearby options
Blood requests: create and manage requests for blood
Real-time updates: Socket.io support for live communication
Email communication: OTP and transactional emails via Nodemailer
AI-powered
AI chat assistant: helps users navigate the platform and answers general questions about blood donation
Urgency classification: classifies how urgent a blood request is
Smart donor matching: helps match requests with suitable donors
Eligibility guidance: helps users understand whether they may be able to donate (not a medical diagnosis)
Security and authentication
Email signup with OTP verification
JWT access tokens with rotating refresh tokens
Password hashing with bcrypt
Account lockout after repeated failed logins
Password reset via email link
Security middleware: Helmet, rate limiting, request sanitization
Role support: donor, receiver, admin
🛠️ Tech Stack
Layer	Technologies
Frontend	React
Backend	Node.js, Express.js
Database	MongoDB with Mongoose (GeoJSON + 2dsphere index for location queries)
Real-time	Socket.io
Auth	JWT, bcryptjs, OTP via email
Email	Nodemailer
Other services	Firebase
Security	Helmet, express-rate-limit, CORS, custom sanitize middleware
📁 Project Structure
blood-donation-backend/
├── client/              # React frontend
└── server/              # Express API
    ├── config/          # Configuration (e.g. mailer)
    ├── controllers/     # Request handlers
    ├── middleware/      # Auth, sanitization, error handling
    ├── models/          # Mongoose models (User, Token, ...)
    ├── routes/          # API route definitions
    ├── services/        # Business logic (AI features, etc.)
    └── server.js        # App entry point
🚀 Getting Started
Prerequisites
Node.js (v18 or later recommended)
A MongoDB database (local or MongoDB Atlas)
An email account/service for sending OTPs
API key for the AI provider you use for the chat/matching features
1. Clone the repository
bash
git clone https://github.com/rishu1208m/blood-donation-backend.git
cd blood-donation-backend
2. Set up the server
bash
cd server
npm install

Create a .env file inside server/:

env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173

# Email (Nodemailer): add the variables your config/mailer.js expects
# AI provider: add the API key variable your AI service expects

Never commit your .env file. Keep it listed in .gitignore.

Start the server:

bash
npm start

The API runs at http://localhost:5000.

3. Set up the client
bash
cd ../client
npm install
npm run dev

Point the client's API base URL at your server (http://localhost:5000).

🔌 API Overview
Base route	Purpose
/api/auth	Signup, OTP verification, login, token refresh, logout, password reset
/api/requests	Blood requests
/api/users	User and donor profiles
/api/search	Donor search
/api/ai	AI features (login required)

AI endpoints (all POST except status, and rate limited):

Endpoint	Description
GET /api/ai/status	Check whether AI features are available
POST /api/ai/chat	Chat assistant
POST /api/ai/classify-urgency	Classify request urgency
POST /api/ai/smart-match	Match a request with donors
POST /api/ai/eligibility-check	Donor eligibility guidance
📸 Screenshots

Add screenshots of the home page, donor search, request flow and AI chat here.

💡 What I Learned
Building a full-stack application from the ground up
Connecting multiple services (database, email, real-time, AI) into one product
Designing user flows around a real-world, time-sensitive problem
Building secure authentication with OTP, token rotation and lockouts
🗺️ Roadmap
 Automated tests
 API documentation (Swagger/OpenAPI)
 Deployment guide
 Stricter per-user rate limits and CORS configuration for production
👤 Author

Rishab Mishra GitHub: @rishu1208m
