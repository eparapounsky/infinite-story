import express from 'express';
const app = express();
const port = 5000;
import OpenAI from 'openai';
app.use(express.json());
// load environment variables
import dotenv from 'dotenv';
dotenv.config();

// initialize openai client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// express routes
app.post('/story', async (req, res) => { 
  const prompt = req.body.prompt; // extract user prompt; use "prompt" as key in frontend

  // validation for prompt
  if (prompt === "") {
    res.status(400).json({error:'Prompt is empty.'});
    return;
  }

  try {
    // send prompt to openai
    // API reference: https://platform.openai.com/docs/api-reference/chat/create?lang=node.js
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // model can be changed; available models- https://platform.openai.com/docs/models
      messages: [
        { role: 'system', content: 'You are an imaginative storyteller.' }, // high level instructions
        { role: 'user', content: prompt }, // prompt from user
      ],
      max_completion_tokens: 300, // length of story 
    });

    // receive story response from openai
    const response = completion.choices[0].message.content;

    // send story to frontend
    res.json({story: response}); // use "story" as key in frontend
  } catch (error) {
    console.error('Error occurred creating story.');
    res.status(500).json({error:'Error occurred creating story.'});
  }
});

// start the server
app.listen(port, () => {
  console.log(`App  listening on port ${port}`)
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
