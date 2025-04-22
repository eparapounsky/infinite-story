const express = require('express')
const app = express()
const port = 5000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// Citation for file structure
// Date: 4/22/2025
// Copied from: https://expressjs.com/en/starter/hello-world.html
