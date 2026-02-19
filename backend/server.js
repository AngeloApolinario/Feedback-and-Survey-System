require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

//ROUTES
const authRoutes = require("./routes/auth");
const surveyRoutes = require("./routes/survey");

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.url}`);
  next();
});

//MOUNTING ROUTES
app.use("/api/user", authRoutes);
app.use("/api/surveys", surveyRoutes);

app.get("/test", (req, res) =>
  res.json({ message: "Backend is running on 5050!" }),
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected!");
    const PORT = process.env.PORT || 5050;
    app.listen(PORT, () =>
      console.log(`🚀 Server on http://localhost:${PORT}`),
    );
  })
  .catch((err) => console.error("❌ Connection error:", err));
