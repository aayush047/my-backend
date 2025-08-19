const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

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
    await transporter.sendMail(mailToOwner);
    await transporter.sendMail(mailToUser);
    res.status(200).json({ message: "✅ Email sent successfully!" });
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    res.status(500).json({ message: "❌ Something went wrong." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
