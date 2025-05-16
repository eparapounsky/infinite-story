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
// set up middleware
app.use(cors());
app.use(express.json());

// initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// initialize conversation history with high level instructions
let history = [
  { role: "system", content: "You are an imaginative storyteller." },
];

// ------------------- endpoint where story creation begins + continues -------------------
app.post("/story", async (req, res) => {
  const { prompt, genre, tone, theme } = req.body;

  // validation for prompt
  if (!prompt || prompt.trim() === "") {
    res.status(400).json({ error: "Prompt is empty." });
    return;
  }

  try {
    // build a styled prompt using genre, tone, and theme
    let styledPrompt = "";
    if (history.length === 1) {
      styledPrompt =
        [
          tone ? `a ${tone}` : "an entertaining",
          genre ? `${genre} story` : "story",
          `about "${prompt.trim()}"`,
          theme ? `with a theme of ${theme}` : "",
        ]
          .filter(Boolean)
          .join(" ") + ".";
    } else {
      styledPrompt = "Continue the story"; // avoid continously giving initial prompts
    }

    // add user prompt to history
    history.push({ role: "user", content: styledPrompt });

    // send prompt to openai
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: history,
      max_completion_tokens: 300, // length of story
    });

    // receive story response from openai + add GPT response to history
    const story_response = completion.choices[0].message.content;
    history.push({ role: "assistant", content: story_response });

    // use GPT's response to generate image
    const result = await openai.images.generate({
      model: "dall-e-3",
      prompt: "Do not depict any words or letters.".concat(story_response),
      size: "1024x1024",
    });

    // receive image response from openai
    const image_response = result.data[0].url;

    // send story and image to frontend
    let story_and_image = [
      { story: story_response },
      { image: image_response },
    ];
    res.json(story_and_image);
  } catch (error) {
    console.error("Error occurred creating story: ", error);
    res.status(500).json({ error: "Error occurred creating story." });
  }
});

// ------------------- endpoint to regenerate story chunk -------------------
app.post("/regenerate", async (req, res) => {
  try {
    // add message to history asking GPT to try again
    history.push({
      role: "user",
      content: "Try again",
    });

    // send prompt to openai
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: history,
      max_completion_tokens: 300, // length of story
    });

    // receive story response from openai + add GPT response to history
    const story_response = completion.choices[0].message.content;
    history.push({ role: "assistant", content: story_response });

    // use GPT's response to generate image
    const result = await openai.images.generate({
      model: "dall-e-3",
      prompt: "Do not depict any words or letters.".concat(story_response),
      size: "1024x1024",
    });

    // receive image response from openai
    const image_response = result.data[0].url;

    // send story and image to frontend
    let story_and_image = [
      { story: story_response },
      { image: image_response },
    ];
    res.json(story_and_image);
  } catch (error) {
    console.error("Error occurred regenerating story: ", error);
    res.status(500).json({ error: "Error occurred regenerating story." });
  }
});

// ------------------- endpoint for resetting story history -------------------
app.post("/new", async (req, res) => {
  try {
    // replace all history with high level instructions
    history = [
      { role: "system", content: "You are an imaginative storyteller." },
    ];
  } catch (error) {
    console.error("Error occurred resetting story: ", error);
    res.status(500).json({ error: "Error occurred resetting story." });
  }
});

// ------------------- start the server -------------------
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
// List of available models: https://platform.openai.com/docs/models

// Citation for context management
// Date: 5/8/2025
// Adapted from: https://platform.openai.com/docs/guides/conversation-state?api-mode=responses

// Citation for DALL-E image generation
// Date: 5/9/2025
// Adapted from: https://platform.openai.com/docs/guides/image-generation?image-generation-model=dall-e-3
// using DALLE 3 for higher quality & more realistic images (DALLE 2 is unreliable); cost $0.04 per image
// pricing: https://platform.openai.com/docs/pricing#image-generation
