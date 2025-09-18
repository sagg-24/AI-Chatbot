import express from "express"; 
import cors from "cors"; //Connects frontend & backend
import dotenv from "dotenv"; 
import fetch from "node-fetch"; // Server ka inu sameeyo HTTP request ku socda Gemini API.

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

const GEMINI_API_KEY = "old_expired_key";


// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: " Server is running", timestamp: new Date().toISOString() });
});

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  
  console.log(" Received message:", message);
  
  if (!message) {
    return res.status(400).json({ reply: "No message provided" });
  }

  if (!GEMINI_API_KEY) {
    console.error(" GEMINI_API_KEY not found in environment variables");
    return res.status(500).json({ reply: "Server configuration error" });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }],
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API Error:", errText);
      return res.status(500).json({ reply: "Gemini API request failed" });
    }

    const data = await response.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.output ||
      "Sorry, no response from Gemini";

    res.json({ reply }); // 
  
  } catch (error) {
    console.error("Server error:", error);
    res
      .status(500)
      .json({ reply: "Server error: Could not reach Gemini API" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` CORS enabled for: http://localhost:5173`);
});
