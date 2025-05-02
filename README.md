# Infinite Story Generator

A full-stack web application that uses OpenAI's GPT API to generate continuous, themed stories based on user prompts, with support for future image integration.

## Prerequisites

* **Node.js** and **npm** installed (v14+ recommended).

## Repository Structure

```
/capstone
├── backend
│   ├── server.js       # Express server with GPT and CORS
│   ├── .env            # Environment variables (not committed)
│   └── package.json
└── frontend
    ├── src/App.js      # React app entry point
    └── package.json
```

## Backend Setup (Express)

1. **Create your `.env` file** in `/backend` (next to `server.js`):

   ```env
   OPENAI_API_KEY=sk-⋯YOUR_KEY⋯
   ```
2. **Ensure** your `.gitignore` (in `/backend`) contains:

   ```gitignore
   .env
   ```
3. **Install dependencies**, including CORS:

   ```bash
   cd backend
   npm install
   npm install cors
   ```
4. **Start the server**:

   ```bash
   node server.js
   ```

   The backend listens on **[http://localhost:5000](http://localhost:5000)** and exposes the `/story` POST endpoint.

## Frontend Setup (React)

1. **Install dependencies**:

   ```bash
   cd frontend
   npm install
   ```
2. **Start the development server**:

   ```bash
   npm start
   ```

   Opens the app at **[http://localhost:3000](http://localhost:3000)**.

## How to Use

1. Open your browser to **[http://localhost:3000](http://localhost:3000)**.
2. (Optional) Select **Genre**, **Tone**, and **Theme** from the dropdowns.
3. Type your story prompt into the textarea, for example:

   > A dragon guarding a mysterious cave in the mountains.
4. Click **Continue** to send the prompt to the backend and generate a story.
5. The generated text will appear in the **Story** section.

## CORS & Environment Notes

* **CORS Enabled**: The backend uses the `cors` middleware to allow requests from `localhost:3000`.
* **Environment Variables**: We use `dotenv` to load your `OPENAI_API_KEY` from `.env`—never commit this file.

## Next Steps & Enhancements

* **Integrate genre/tone/theme** into the GPT prompt.
* Implement **Undo** and **Regenerate** features using a history stack.
* Add **New Story** button logic to reset all app state.
* Hook up **DALL·E** for contextual image generation alongside each story segment.
* Manage long-term context via summarization or chunking to stay under token limits.

---

© 2025 Infinite Story Generator. Created by Vincent Le & Elena Parapounsky.
