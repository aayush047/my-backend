const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
// const path = require("path");

require("dotenv").config(); // Optional (can still use .env for email config)

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Connect to **Local MongoDB**
mongoose
  .connect("mongodb://127.0.0.1:27017/contactForm", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected (Local)"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Schema
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
});

const Contact = mongoose.model("Contact", contactSchema);

// 📩 POST Route
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailToOwner = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: "New Message from Portfolio",
    text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`,
  };

  const mailToUser = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Thanks for contacting!",
    text: `Hi ${name},\n\nThanks for reaching out. I received your message:\n"${message}"\n\nI'll get back to you soon.\n\n- Aayush Patidar`,
  };

  try {
    await new Contact({ name, email, message }).save();
    await transporter.sendMail(mailToOwner);
    await transporter.sendMail(mailToUser);

    res.status(200).json({ message: "Message sent and saved successfully!" });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
