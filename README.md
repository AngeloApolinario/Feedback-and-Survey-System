# SurveyHub | Elite Survey Analytics & Design

SurveyHub is a high-performance, full-stack survey platform built for modern data collection. It features a cinematic Glassmorphic UI, real-time analytics, and a seamless respondent experience.

---

## 🛠 Tech Stack

- **Frontend:** Vue 3 (Composition API), Tailwind CSS, Vite
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens (JWT) & Bcrypt

---

## Installation & Setup

### 1. Database Setup

1.  Create a MongoDB Atlas cluster or start a local MongoDB instance.
2.  Copy your **Connection String**.

### 2. Backend Configuration

1.  Navigate to your server directory: `cd server`.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file and add the following:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=award_winning_secret_key_123
    ```
4.  Start the server:
    ```bash
    npm start
    ```

### 3. Frontend Configuration

1.  Navigate to your client directory: `cd client`.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

---

##  How to Use SurveyHub

### **Step 1: The Design Phase (Creator Mode)**

- **Create:** Toggle the top switch to **Manage** and click `+ Create Survey`.
- **Logic:** Add questions using the dynamic builder. You can choose between **Multiple Choice**, **Checkboxes**, or **Short Answer**.
- **Launch:** Once saved, your survey instantly appears in the **Explore** tab for all other registered users.

### **Step 2: The Respondent Experience (Explore Mode)**

- **Discover:** Toggle to **Explore** to see surveys created by the community.
- **Interaction:** Click `Start Survey` to enter the cinematic fullscreen mode.
- **Persistence:** The system automatically tracks if you have already responded, preventing duplicate entries.

### **Step 3: Data Analytics**

- **Real-time Insights:** Back in **Manage** mode, click `View Analytics` on your card.
- **Visualizations:** \* **Summary Tab:** See automated bar charts and percentage breakdowns for every question.
  - **Individual Tab:** Audit specific responses to see exactly what each user submitted and when.

---

## 💎 Pro UX Features

- **Skeleton Loading:** No more jarring white screens; the app uses pulse-animations during data fetch.
- **Smart Search:** Use the header search bar to filter through hundreds of surveys instantly.
- **Progress Tracking:** The respondent view includes a top-mounted progress bar to reduce survey abandonment.
- **Empty States:** Custom illustrations and call-to-actions appear when no data is available.

---

## Project Structure

```text
├── client/
│   ├── src/
│   │   ├── components/  # Reusable UI parts
│   │   ├── views/       # Login, Register, Dashboard
│   │   ├── services/    # Axios API configuration
│   │   └── App.vue      # Main entry point
├── server/
│   ├── models/          # Mongoose Schemas (User, Survey, Response)
│   ├── routes/          # Express API Endpoints
│   ├── controllers/     # Business logic & Analytics math
│   └── server.js        # Entry point
```
