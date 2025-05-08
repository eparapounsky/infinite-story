// load environment variables
import dotenv from "dotenv";
dotenv.config();
// import APIs
import express from "express";
import OpenAI from "openai";
import cors from "cors";
// create app
const app = express();
const port = 5000;
app.use(cors());
app.use(express.json());

// initialize openai client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// initialize conversation history
let history = [
  { role: "system", content: "You are an imaginative storyteller." }, // high level instructions
];

// express routes
app.post("/story", async (req, res) => {
  const { prompt, genre, tone, theme } = req.body;

  // validation for prompt
  if (!prompt || prompt.trim() === "") {
    res.status(400).json({ error: "Prompt is empty." });
    return;
  }

  try {
    // build a styled prompt using genre, tone, and theme
    const styledPrompt =
      [
        tone ? `a ${tone}` : "an entertaining",
        genre ? `${genre} story` : "story",
        `about "${prompt.trim()}"`,
        theme ? `with a theme of ${theme}` : "",
      ]
        .filter(Boolean)
        .join(" ") + ".";

    history.push({ role: "user", content: styledPrompt }); // add user prompt to history

    // send prompt to openai
    // API reference: https://platform.openai.com/docs/api-reference/chat/create?lang=node.js
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // model can be changed; available models- https://platform.openai.com/docs/models
      messages: history,
      // [
      //   { role: "system", content: "You are an imaginative storyteller." }, // high level instructions
      //   { role: "user", content: styledPrompt }, // prompt from user
      // ]
      max_completion_tokens: 300, // length of story
    });

    // receive story response from openai
    const response = completion.choices[0].message.content;

    // send story to frontend
    res.json({ story: response }); // use "story" as key in frontend
  } catch (error) {
    console.error("Error occurred creating story: ", error);
    res.status(500).json({ error: "Error occurred creating story." });
  }
});

// start the server
app.listen(port, () => {
  console.log(`App  listening on port ${port}`);
});

// Citation for file structure
// Date: 4/22/2025
// Adapted from: https://expressjs.com/en/starter/hello-world.html

// Citation for adding OpenAI API
// Date: 4/27/2025
// Copied from: https://community.openai.com/t/import-error-with-openaiapi-in-node-js-project/549074

// Citation for call to OpenAI API
// Date: 4/27/2025
// Adapted from: https://www.npmjs.com/package/openai#:~:text=openai/openai%27%3B-,Usage,-The%20full%20API

// Citation for context management
// Date: 5/8/2025
// Adapted from: https://platform.openai.com/docs/guides/conversation-state?api-mode=responses
