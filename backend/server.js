const express = require('express');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
const Snippet = require('./models/Snippet'); 
require('dotenv').config(); 

const app = express();
app.use(cors());
app.use(express.json()); 

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('connected to MongoDB');
  } catch (error) {
    console.error('connection Failed:', error.message);
    process.exit(1);
  }
};
connectDB();
app.post('/api/snippets', async (req, res) => {
  try {
    const { files } = req.body; 
    const newSnippet = new Snippet({ files });
    await newSnippet.save();
    
    res.status(201).json({ success: true, id: newSnippet.snippetId });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to save snippet' });
  }
});

app.get('/api/snippets/:id', async (req, res) => {
  try {
    const snippet = await Snippet.findOne({ snippetId: req.params.id });
    if (!snippet) {
      return res.status(404).json({ success: false, error: 'Snippet not found' });
    }
    res.json({ success: true, data: snippet });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { files, chatHistory, message } = req.body;
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const formattedHistory = chatHistory.map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    let finalMessage = message;
    if (chatHistory.length === 0) {
      const codeContext = files.map(f => `File: ${f.name}\nLanguage: ${f.language}\nCode:\n${f.content}`).join('\n\n--- \n\n');
      finalMessage = `Here is the codebase I am looking at:\n\n${codeContext}\n\nUser Question: ${message}`;
    }

  
    const chat = model.startChat({ history: formattedHistory });
    const result = await chat.sendMessage(finalMessage);
    const response = await result.response;
    
    res.json({ success: true, text: response.text() });
    
  } catch (error) {
    console.error('Gemini AI Chat Error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate response' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`running on port ${PORT}`));