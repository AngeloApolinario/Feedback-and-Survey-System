# 🛸 SurveyHub | Elite Analytics & Cinematic UX

SurveyHub is a high-performance, full-stack survey ecosystem designed to bridge the gap between complex data collection and beautiful user experiences. Featuring a **Glassmorphic UI**, real-time analytics, and a cinematic fullscreen respondent mode.

---

## ✨ Pro UX Features

- **Cinematic Transitions:** Powered by Vue `transition-group`, featuring shake animations for restricted access and scale-pops for success states.
- **Intelligent Auto-Open:** URL-driven modal triggers that respect survey "Open/Closed" states to prevent dead-end navigation.
- **Creator Insights:** Real-time response counters (totalResponses) and question-count badges exclusive to the survey owner.
- **Glassmorphic Design:** A 70% opacity backdrop-blur header and 3D hover effects with premium border-shines.
- **Live Progress Tracking:** Top-mounted dynamic progress bars that update in real-time as users navigate questions.

---

## 🛠 Tech Stack

- **Frontend:** Vue 3 (Composition API), Tailwind CSS, Vite, Lucide Icons
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Security:** JSON Web Tokens (JWT) & Bcrypt password hashing

---

## 🚀 Installation & Setup

### 1. Database Setup

1. Launch a MongoDB Atlas cluster or a local instance.
2. Retrieve your **Connection String**.

### 2. Backend Configuration

Navigate to the server folder, install dependencies, and create a .env file:

$ cd server
$ npm install

# .env content:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=award_winning_secret_key_123

$ npm start

### 3. Frontend Configuration

Navigate to the client folder and launch the development server:

$ cd client
$ npm install
$ npm run dev

---

## 🕹 The Workflow

### **Step 1: Design Phase (Creator Mode)**

Toggle to **Manage** mode. Use the dynamic builder to mix **Multiple Choice**, **Checkboxes**, and **Short Text**. Set your survey to **Public** for discovery or **Private** for link-only access.

### **Step 2: Distribution & Security**

Copy the unique survey link with one click. If you toggle a survey to **Closed**, the system automatically triggers an **Access Restricted** overlay for any late-comers, featuring a "lock" micro-interaction and shake animation.

### **Step 3: Elite Analytics**

Audit your data through two distinct lenses:

- **Summary View:** Beautifully animated percentage bars showing community trends.
- **Individual View:** A deep-dive audit trail of every response, complete with user timestamps and specific answers.

---

## 📂 Project Architecture

├── client/
│ ├── src/
│ │ ├── services/ # Axios interceptors & API wrappers
│ │ ├── views/ # Dashboard.vue (The heart of the app)
│ │ └── assets/ # Premium styles & transitions
├── server/
│ ├── models/ # Survey, Response, and User schemas
│ ├── controllers/ # Analytics math & Aggregation logic
│ └── middleware/ # JWT Authentication guards

---

## 🛡 Security Note

SurveyHub uses JWT stored in localStorage for rapid prototyping. For enterprise-grade production, it is recommended to migrate to httpOnly cookies to mitigate XSS risks.
