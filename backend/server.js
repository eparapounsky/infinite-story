// load environment variables
import dotenv from "dotenv";
dotenv.config();

// import APIs
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

// derive __dirname for ES module scope
const __filename = fileURLToPath(import.meta.url); // __filename is the absolute path to this file
const __dirname = path.dirname(__filename); // __dirname is the directory that contains this file

// create app
const app = express();
const PORT = process.env.PORT || 5000; // default to 5000 locally

// set up middleware
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  // rate limiting middleware
  windowMs: 60 * 1000, // 1 minute
  limit: 5, // limit each IP to 5 requests per window
  message: { error: "Too many requests, please try again later." },
});

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

/**
 * Sanitizes user input to make sure it's safe for processing.
 * @param {string} prompt - The input string to sanitize.
 * @returns {string} The sanitized prompt string.
 */
function sanitizePrompt(prompt) {
  let sanitizedPrompt = prompt.trim();
  sanitizedPrompt = sanitizedPrompt.replace(/<[^>]*>?/gm, ""); // remove HTML tags
  return sanitizedPrompt;
}

/**
 * Builds a styled prompt based on user parameters
 * @param {Object} params - The prompt parameters
 * @param {boolean} isFirstChunk - Whether this is the first story chunk
 * @returns {string} The styled prompt
 */
function buildStyledPrompt(sanitizedPrompt, { genre, tone, theme }, isFirstChunk) {
  if (isFirstChunk) {
    return [
      "Give the beginning of",
      tone ? `a ${tone}` : "an entertaining",
      genre ? `${genre} story` : "story",
      `about "${sanitizedPrompt.trim()}"`,
      theme ? `with a theme of ${theme}.` : ".",
      "Write under 200 words in complete sentences.",
    ]
      .filter(Boolean)
      .join(" ") + ".";
  } else {
    // subsequent chunks: incorporate whatever the user typed into the continuation cue
    styledPrompt =
      `Continue the story about "${sanitizedPrompt.trim()}" ` +
      `in under 200 words. Carry the plot forward smoothly.`;
  }
}

// endpoint to begin + continue + regenerate story
app.post("/story", limiter, async (req, res) => {
  try {
    const { prompt, genre, tone, theme } = req.body;

    const sanitizedPrompt = sanitizePrompt(prompt);
    if (!sanitizedPrompt) {
      return res.status(400).json({ error: "Prompt is empty." });
    }

    const isFirstChunk = history.length === 1;
    const styledPrompt = buildStyledPrompt(sanitizedPrompt, { genre, tone, theme }, isFirstChunk)
    history.push({ role: "user", content: styledPrompt });

    // send prompt to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: history,
      max_completion_tokens: 250, // length of story
      stop: ["<<END>>"], // use a stop sequence to avoid cutting off mid-sentence
      stream: true, // enable streaming to get response in chunks
    });

    let storyChunk = "";

    // stream GPT output
    for await (const chunk of completion) {
      const content = chunk.choices[0].delta.content;

      if (content) {
        storyChunk += content;
        res.write(JSON.stringify({ story: content }) + "\n"); // send each chunk to client as it arrives
      }
    }

    history.push({ role: "assistant", content: storyChunk }); // add GPT response to history

    // use GPT's response to generate image
    const result = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a family-friendly image based on: ${storyChunk}`, // avoid image_generation_user_error
      size: "1024x1024",
    });

    res.write(JSON.stringify({ image: result.data[0].url }) + "\n"); // after streaming story, send image url as a final JSON line
    res.end(); // end stream
  } catch (error) {
    console.error("Error in POST /story: ", error);
    return res.status(500).json({ error: "Error occurred creating story." });
  }
});

// endpoint to undo last turn
app.post("/undo", (req, res) => {
  try {
    // remove the last assistant message and its corresponding user prompt
    let removed = 0;
    for (let i = history.length - 1; i >= 0 && removed < 2; i--) {
      if (history[i].role !== "system") {
        history.splice(i, 1);
        removed++;
      }
    }
    // acknowledge success so client can safely update its UI
    // needed because otherwise the client will not receive any response and will hang/time out
    return res.sendStatus(200);
  } catch (error) {
    console.error("Error in POST /undo: ", error);
    return res.status(500).json({ error: "Error occurred undoing story." });
  }
});

// endpoint to reset story history
app.post("/new", async (req, res) => {
  try {
    // wipe the entire conversation context, leave only system message
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
    console.error("Error in POST /new: ", error);
    res.status(500).json({ error: "Error occurred resetting story." });
  }
});

// static serve the react build
// point express at the “frontend/build” folder, so any file request under /static, /favicon.ico, etc., will be served automatically
app.use(express.static(path.resolve(__dirname, "../frontend/build")));

// catch all: for any route not handled above (like GET /), send back index.html
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/build", "index.html"));
});

// start the server
app.listen(PORT, () => {
  console.log(`App  listening on port ${PORT}`);
});

// export the app for testing purposes to import it in test files
export default app;
