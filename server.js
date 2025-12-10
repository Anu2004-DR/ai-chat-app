import express from "express";
import cors from "cors";
import fs from "fs";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// GROQ client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// JSON chat storage file
const CHAT_FILE = "chatHistory.json";

if (!fs.existsSync(CHAT_FILE)) {
  fs.writeFileSync(CHAT_FILE, JSON.stringify([]));
}

function loadChat() {
  return JSON.parse(fs.readFileSync(CHAT_FILE));
}

function saveChat(data) {
  fs.writeFileSync(CHAT_FILE, JSON.stringify(data, null, 2));
}

// Fetch chat history
app.get("/api/chat", (req, res) => {
  res.json(loadChat());
});

// Handle new chat message
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    const chatHistory = loadChat();
    chatHistory.push({ sender: "user", text: message });

    // Call GROQ AI
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are a helpful AI assistant." },
        { role: "user", content: message },
      ],
    });

    const aiReply = completion.choices[0].message.content;

    chatHistory.push({ sender: "ai", text: aiReply });
    saveChat(chatHistory);

    res.json({ reply: aiReply });

  } catch (error) {
    console.error("GROQ Error:", error);
    res.status(500).json({ error: "AI request failed" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
