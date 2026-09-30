# 🩸 BloodConnect

A full-stack blood donation platform designed to help people find potential blood donors quickly during urgent situations.

BloodConnect connects **blood donors** with people who need blood, provides location-based donor discovery, supports blood requests, enables real-time communication, and includes AI-assisted features for guidance and donor matching.

> ⚠️ **Medical Disclaimer:** The eligibility feature provides informational guidance only. It is not a medical diagnosis or medical advice. A person's eligibility to donate blood must always be confirmed by a qualified healthcare professional.

---

## ✨ Features

### 🩸 Core Features

* **Donor Registration**

  * Donors can create an account and provide their blood group and relevant details.

* **Find Blood Donors**

  * Search for potential donors based on blood group and other requirements.

* **Location-Based Donor Search**

  * Find nearby potential donors and view the approximate distance from the requester.
  * Uses MongoDB GeoJSON and a `2dsphere` index for geospatial queries.

* **Blood Requests**

  * Create and manage blood requests.
  * Provide information about the required blood group and urgency.

* **Real-Time Updates**

  * Socket.io integration for real-time communication and updates.

* **Email Communication**

  * OTP verification and transactional emails using Nodemailer.

---

## 🤖 AI-Powered Features

### AI Chat Assistant

An AI-powered chat assistant helps users navigate the platform and provides general information related to blood donation.

### Urgency Classification

Assists in classifying the urgency of a blood request so users can better organize and prioritize requests.

### Smart Donor Matching

Assists in identifying potential donors based on the requirements of a blood request.

### Eligibility Guidance

Provides general informational guidance about whether someone may be eligible to donate blood.

> This feature should not be used as a substitute for professional medical screening.

---

## 🔐 Authentication & Security

BloodConnect includes multiple authentication and security mechanisms:

* Email signup with OTP verification
* JWT-based authentication
* Access tokens with rotating refresh tokens
* Password hashing using `bcryptjs`
* Password reset through email
* Account lockout after repeated failed login attempts
* Helmet security middleware
* Rate limiting
* Request sanitization
* CORS configuration
* Role-based access control

### User Roles

The application supports:

* 👤 Donor
* 🩸 Receiver
* 🛡️ Admin

---

## 🛠️ Tech Stack

| Layer               | Technologies                                                     |
| ------------------- | ---------------------------------------------------------------- |
| Frontend            | React.js                                                         |
| Backend             | Node.js, Express.js                                              |
| Database            | MongoDB, Mongoose                                                |
| Location Search     | GeoJSON, MongoDB `2dsphere`                                      |
| Real-Time           | Socket.io                                                        |
| Authentication      | JWT, bcryptjs, OTP                                               |
| Email               | Nodemailer                                                       |
| AI                  | AI API integration                                               |
| Additional Services | Firebase                                                         |
| Security            | Helmet, express-rate-limit, CORS, custom sanitization middleware |

---

## 🏗️ Architecture

The project is organized into separate client and server applications.

```text
blood-donation-backend/
│
├── client/                         # React frontend
│
└── server/                         # Express backend
    │
    ├── config/                     # Application configuration
    │
    ├── controllers/                # Request handlers
    │
    ├── middleware/                 # Authentication, security & error handling
    │
    ├── models/                     # MongoDB/Mongoose models
    │
    ├── routes/                     # API routes
    │
    ├── services/                   # Business logic & AI services
    │
    └── server.js                   # Server entry point
```

---

## 🔄 How It Works

```text
User
  │
  ▼
React Frontend
  │
  ▼
Express REST API
  │
  ├── Authentication
  ├── Blood Requests
  ├── Donor Search
  ├── AI Services
  └── Real-Time Communication
  │
  ▼
MongoDB
```

For location-based donor discovery:

```text
Blood Request
      │
      ▼
Required Blood Group
      │
      ▼
MongoDB Geospatial Query
      │
      ▼
Nearby Potential Donors
      │
      ▼
Distance-Based Results
```

---

# 🚀 Getting Started

## Prerequisites

Before running the project, make sure you have:

* [Node.js](https://nodejs.org/) v18 or later
* MongoDB or MongoDB Atlas
* An email service/account for sending OTPs
* An API key for the AI service used by the application
* Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/rishu1208m/blood-donation-backend.git

cd blood-donation-backend
```

---

## 2. Setup the Backend

Navigate to the server directory:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `server` directory:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_long_random_secret

CLIENT_URL=http://localhost:5173

# Email configuration
# Add the variables required by config/mailer.js

# AI configuration
# Add the API key required by your AI service
```

### Important

Never commit your `.env` file.

Make sure `.env` is included in your `.gitignore`:

```gitignore
.env
node_modules/
```

Start the backend:

```bash
npm start
```

The API will run at:

```text
http://localhost:5000
```

---

## 3. Setup the Frontend

Open another terminal and navigate to the client directory:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally run at:

```text
http://localhost:5173
```

Make sure the frontend API base URL points to your backend:

```text
http://localhost:5000
```

---

# 🔌 API Overview

| Route           | Purpose                                                                   |
| --------------- | ------------------------------------------------------------------------- |
| `/api/auth`     | Signup, OTP verification, login, token refresh, logout and password reset |
| `/api/requests` | Create and manage blood requests                                          |
| `/api/users`    | User and donor profiles                                                   |
| `/api/search`   | Donor search and location-based queries                                   |
| `/api/ai`       | AI-powered features                                                       |

---

## 🤖 AI API Endpoints

| Method | Endpoint                    | Description                                |
| ------ | --------------------------- | ------------------------------------------ |
| `GET`  | `/api/ai/status`            | Check AI service availability              |
| `POST` | `/api/ai/chat`              | AI chat assistant                          |
| `POST` | `/api/ai/classify-urgency`  | Classify blood request urgency             |
| `POST` | `/api/ai/smart-match`       | Assist with donor matching                 |
| `POST` | `/api/ai/eligibility-check` | Provide informational eligibility guidance |

AI endpoints require authentication and are rate limited.

---

# 💡 What I Learned

Building BloodConnect helped me gain practical experience in full-stack development and taught me how different parts of a real-world application work together.

Through this project, I learned about:

* Building a full-stack application from scratch
* Designing REST APIs with Node.js and Express.js
* Working with MongoDB and Mongoose
* Implementing geospatial queries using GeoJSON and `2dsphere`
* Building authentication using JWT
* Implementing OTP-based email verification
* Password hashing and account security
* Token refresh and rotation
* Real-time communication using Socket.io
* Integrating email services using Nodemailer
* Integrating AI-powered functionality
* Structuring backend code using controllers, routes, middleware, models and services
* Designing user flows around a real-world, time-sensitive problem

---

# 🗺️ Roadmap

Future improvements planned for the project:

* [ ] Automated unit and integration tests
* [ ] Swagger/OpenAPI documentation
* [ ] Complete production deployment guide
* [ ] More granular per-user rate limiting
* [ ] Production-level CORS configuration
* [ ] Improved donor matching algorithms
* [ ] Better notification system
* [ ] Improved monitoring and logging

---

# 👨‍💻 Author

**Rishab Mishra**

GitHub: [@rishu1208m](https://github.com/rishu1208m)

---

## ⭐ Support

If you find this project interesting, consider giving the repository a ⭐ on GitHub.

Built with ❤️ to make finding potential blood donors faster and more accessible.
