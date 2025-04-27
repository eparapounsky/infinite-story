import express from 'express'
const app = express()
const port = 5000
import OpenAI from 'openai'
// load environment variables
import dotenv from 'dotenv'
dotenv.config()

// initialize openai client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// express routes
app.get('/', (req, res) => {
  res.send('Hello World!')
})

const response = await client.responses.create({
  model: 'gpt-4o',
  instructions: 'You are a coding assistant that talks like a pirate',
  input: 'Are semicolons optional in JavaScript?',
});

console.log(response.output_text);

// start the server
app.listen(port, () => {
  console.log(`App  listening on port ${port}`)
})

// Citation for file structure
// Date: 4/22/2025
// Copied from: https://expressjs.com/en/starter/hello-world.html

// Citation for adding OpenAI API
// Date: 4/27/2025
// Copied from: https://community.openai.com/t/import-error-with-openaiapi-in-node-js-project/549074

// Citation 
// Date: 4/27/2025
// Copied from: https://www.npmjs.com/package/openai#:~:text=openai/openai%27%3B-,Usage,-The%20full%20API