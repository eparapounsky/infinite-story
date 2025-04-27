const express = require('express')
const app = express()
const port = 5000
const OpenAI = require("openai");
require('dotenv').config(); // load environment variables

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// Citation for file structure
// Date: 4/22/2025
// Copied from: https://expressjs.com/en/starter/hello-world.html

// Citation for adding OpenAI API
// Date: 4/27/2025
// Copied from: https://community.openai.com/t/import-error-with-openaiapi-in-node-js-project/549074