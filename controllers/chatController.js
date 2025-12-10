require("dotenv").config();
const { Deepseek } = require("@deepseek-ai/sdk");
const deepseek = new Deepseek({ apiKey: process.env.DEEPSEEK_API_KEY });

let chatHistory = []; // already storing messages in memory

exports.sendMessage = async (req, res) => {
    try {
        const userMessage = req.body.message;

        // 1. Save user message
        chatHistory.push({ sender: "user", text: userMessage });

        // 2. Call DeepSeek AI
        const response = await deepseek.chat.completions.create({
            model: "deepseek-chat",
            messages: [
                { role: "system", content: "You are an AI assistant that replies clearly." },
                { role: "user", content: userMessage }
            ]
        });

        const aiReply = response.choices[0].message.content;

        // 3. Save AI reply
        chatHistory.push({ sender: "ai", text: aiReply });

        res.json({ reply: aiReply, history: chatHistory });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "AI request failed" });
    }
};

exports.getHistory = (req, res) => {
    res.json(chatHistory);
};
