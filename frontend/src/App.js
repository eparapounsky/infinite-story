import { useState } from "react";
import { AiOutlineRedo } from "react-icons/ai";
import { BiUndo } from "react-icons/bi";
import { IoMdArrowForward } from "react-icons/io";
import "./App.css";

/**
 * Main React component for the app.
 * Handles story generation, image streaming, undo/redo functionality, and UI state management.
 *
 * @component
 * @returns {JSX.Element} The rendered Infinite Story Generator UI.
 */
function App() {
  const [genre, setGenre] = useState("");
  const [tone, setTone] = useState("");
  const [theme, setTheme] = useState("");
  const [prompt, setPrompt] = useState("");
  const [story, setStory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [historyStack, setHistoryStack] = useState([]);
  const [lastPrompt, setLastPrompt] = useState(null);
  const [loading, setLoading] = useState(false); // loading state

  // read base url from process.env if available
  const API_BASE = process.env.REACT_APP_API_BASE_URL || "";

  /**
   * Streams story and image data from a Response object, updating UI state as chunks arrive.
   * Expects each line of the response stream to be a JSON object with either a `story` or `image` property.
   * Accumulates the full story and updates the story state after streaming completes.
   *
   * @async
   * @param {Response} response - The fetch Response object containing a readable stream of story data.
   * @returns {Promise<void>} Resolves when the entire stream has been processed.
   */
  async function streamStory(response) {
    setStory(""); // clear previous story (to avoid appending to previous chunk)
    const reader = response.body.getReader(); // ReadableStream reader to read response byte stream in chunks
    const decoder = new TextDecoder(); // TextDecoder to turn streaming bytes into text
    let buffer = ""; // to temporarily hold incomplete lines
    let fullStory = "";

    while (true) {
      const { value, done } = await reader.read(); // read next chunk of bytes
      if (done) break; // exit loop if no more data

      buffer += decoder.decode(value, { stream: true }); // decode bytes to string and append to buffer
      let lines = buffer.split("\n"); // split buffer into lines by newline character
      buffer = lines.pop(); // keep the last line in buffer (it might be incomplete)

      // process each complete line
      // each line should be a JSON object with either story or image property
      for (const line of lines) {
        if (!line.trim()) continue; // skip empty lines

        const obj = JSON.parse(line); // parse JSON object from line

        if (obj.story) {
          // if the object has a story property
          setStory((prev) => prev + obj.story); // update UI as chunks arrive
          fullStory += obj.story; // accumulate full story
        }

        if (obj.image) {
          // if the object has an image property
          setImageUrl(obj.image);
        }
      }
    }

    // after reading all chunks, update the story state with the full story
    setStory(fullStory);
  }

  /** Continue handler
   * Sends a prompt to the story API, handles the response (streaming or non-streaming),
   * updates the story, image, and history stack, and manages loading state.
   *
   * @async
   * @function
   * @param {Object} payload - The prompt data to send to the API.
   * @returns {Promise<void>}
   */
  async function continueStory(payload) {
    setLoading(true); // start loading
    try {
      const response = await fetch(`${API_BASE}/story`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "Something went wrong."}`);
        return;
      }

      setLastPrompt(payload); // save the last prompt for future use
      streamStory(response);

      // only push if there's something to go back to
      if (story && imageUrl) {
        // include the prompt that generated this chunk
        setHistoryStack((stack) => [
          ...stack,
          { story, imageUrl, prompt: lastPrompt },
        ]);
      }
    } catch (error) {
      console.error("Error creating story or image:", error);

      alert(
        `Error creating story or image. Note that some inappropriate prompts, such as those involving violence or other explicit content, will not generate an image. Please try again with a different prompt.`
      );
    } finally {
      setLoading(false); // stop loading
    }
  }

  /** Regenerate handler
   * Regenerates the current story chunk by undoing the last prompt and re-posting it to the server.
   * Updates the UI with the regenerated story and image.
   *
   * @async
   * @function regenerateStory
   * @returns {Promise<void>} Resolves when the regeneration process is complete.
   */
  async function regenerateStory() {
    if (!lastPrompt || loading) return;
    setLoading(true);
    try {
      // tell server to drop the current chunk
      await fetch(`${API_BASE}/undo`, { method: "POST" });

      // re-POST the exact same payload to /story
      const response = await fetch(`${API_BASE}/story`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lastPrompt),
      });

      streamStory(response);
    } catch (error) {
      console.error("Error regenerating story:", error);
      alert(`Error regenerating story or image. Please try again.`);
    } finally {
      setLoading(false);
    }
  }

  /** Undo handler
   * Handles undoing the last story segment by reverting to the previous state.
   * Updates the story, image URL, and prompt from the history stack, and sends a
   * POST request to the undo API endpoint.
   * Prevents undo if there is no history or if loading is in progress.
   *
   * @async
   * @function handleUndo
   * @returns {Promise<void>} Resolves when the undo operation is complete.
   */
  async function handleUndo() {
    if (historyStack.length === 0 || loading) return; // no history to undo

    setLoading(true);

    try {
      const prevEntry = historyStack[historyStack.length - 1];
      setHistoryStack((stack) => stack.slice(0, -1));
      setStory(prevEntry.story);
      setImageUrl(prevEntry.imageUrl);
      setLastPrompt(prevEntry.prompt);

      await fetch(`${API_BASE}/undo`, { method: "POST" });
    } catch (error) {
      console.error("Error undoing story segment:", error);
      alert("Error undoing last action. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /** New Story handler
   * Resets the story by first requesting the server to wipe its history,
   * then clearing all relevant client-side state variables.
   *
   * @async
   * @function resetStory
   * @returns {Promise<void>} Resolves when the reset process is complete.
   */
  async function resetStory() {
    try {
      // tell server to wipe its history first
      await fetch(`${API_BASE}/new`, { method: "POST" });

      // only after server confirms, clear all client states
      setGenre("");
      setTone("");
      setTheme("");
      setStory("");
      setImageUrl("");
      setHistoryStack([]);
      setPrompt("");
      setLastPrompt(null);
    } catch (error) {
      console.error("Error starting new story:", error);
      alert("Error starting new story. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="App">
      <div className="header">
        <h1>Infinite Story Generator</h1>
      </div>

      <div className="new-div">
        <button onClick={resetStory} disabled={loading}>
          New Story
        </button>
      </div>

      <div className="dropdowns">
        <select value={tone} onChange={(e) => setTone(e.target.value)}>
          <option value="" disabled hidden>
            Tone
          </option>
          <option value="dark">Dark</option>
          <option value="epic">Epic</option>
          <option value="humorous">Humorous</option>
          <option value="lighthearted">Light-hearted</option>
          <option value="melancholic">Melancholic</option>
          <option value="serious">Serious</option>
        </select>

        <select value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option value="" disabled hidden>
            Genre
          </option>
          <option value="adventure">Adventure</option>
          <option value="drama">Drama</option>
          <option value="fantasy">Fantasy</option>
          <option value="horror">Horror</option>
          <option value="mystery">Mystery</option>
          <option value="romance">Romance</option>
          <option value="sci-fi">Sci-Fi</option>
        </select>

        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="" disabled hidden>
            Theme
          </option>
          <option value="fate-and-destiny">Fate & Destiny</option>
          <option value="freedom">Freedom</option>
          <option value="friendship">Friendship</option>
          <option value="good-vs-evil">Good vs. Evil</option>
          <option value="self-discovery">Self-Discovery</option>
          <option value="survival">Survival</option>
        </select>
      </div>

      {/* loading indicator */}
      {loading && (
        <div className="loading"></div>
      )}

      {/* display generated image if available */}
      {imageUrl && (
        <div className="image">
          <img src={imageUrl} alt="Story illustration" />
        </div>
      )}

      <div className="story" id="story">
        {story && <p>{story}</p>}
      </div>

      <textarea
        placeholder="Type your next prompt here..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      ></textarea>

      <div className="buttons">
        {/* continue button pushes history and fetches new story/image */}
        <button
          onClick={() => {
            const payload = { prompt, genre, tone, theme };
            setLastPrompt(payload);
            continueStory(payload);
          }}
          disabled={loading || prompt.trim() === ""}
        >
          Continue <IoMdArrowForward />
        </button>

        {/* undo button pops last state from history */}
        <button
          onClick={handleUndo}
          disabled={loading || historyStack.length === 0}
        >
          Undo <BiUndo />
        </button>

        {/* regenerate button reuses lastPrompt */}
        <button onClick={regenerateStory} disabled={loading || !lastPrompt}>
          Regenerate <AiOutlineRedo />
        </button>
      </div>

      <footer>
        <p> © 2025 Elena Parapounsky. All rights reserved. </p>
        <a href="https://github.com/eparapounsky/infinite-story">
          🔍 Source on GitHub
        </a>
      </footer>
    </div>
  );
}

export default App;
