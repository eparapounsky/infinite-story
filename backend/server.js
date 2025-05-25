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
  {
    role: "system",
    content:
      "You are an imaginative storyteller. You always remember everything that came before " +
      "and never apologize or mention missing context; just continue the story seamlessly.",
  },
];

// ------------------- endpoint to begin + continue story -------------------
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
          "Please write under 200 words in complete sentences, carrying the plot forward smoothly and finishing every sentence without cutting off mid-thought.",
        ]
          .filter(Boolean)
          .join(" ") + ".";
    } else {
      // subsequent chunks: incorporate whatever the user typed into the continuation cue
      styledPrompt =
        `Please continue the story about "${prompt.trim()}" ` +
        `under 200 words in complete sentences, carrying the plot forward smoothly and finishing every sentence without cutting off mid-thought.`;
    }

    // add user prompt to history
    history.push({ role: "user", content: styledPrompt });

    // send prompt to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: history,
      max_completion_tokens: 300, // length of story
      stop: ["<<END>>"],
    });

    // receive story response from OpenAI + add GPT response to history
    const story_response = completion.choices[0].message.content;
    history.push({ role: "assistant", content: story_response });

    // use GPT's response to generate image
    const result = await openai.images.generate({
      model: "dall-e-3",
      prompt: story_response,
      size: "1024x1024",
    });

    // receive image response from OpenAI
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

// ------------------- endpoint to undo last turn -------------------
app.post("/undo", (req, res) => {
  try {
    // Remove the last assistant message and its corresponding user prompt
    let removed = 0;
    for (let i = history.length - 1; i >= 0 && removed < 2; i--) {
      if (history[i].role !== "system") {
        history.splice(i, 1);
        removed++;
      }
    }
    return res.sendStatus(200);
  } catch (error) {
    console.error("Error in /undo:", error);
    return res.status(500).json({ error: "Undo failed." });
  }
});

// ------------------- endpoint to reset story history -------------------
app.post("/new", async (req, res) => {
  try {
    // wipe the entire conversation context
    history = [
      {
        role: "system",
        content:
          "You are an imaginative storyteller. You always remember everything that came before " +
          "and never apologize or mention missing context; just continue the story seamlessly.",
      },
    ];

    // acknowledge success so client can safely clear its UI
    res.sendStatus(200);
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
