import "./App.css";
import { IoMdArrowForward } from "react-icons/io";
import { BiUndo } from "react-icons/bi";
import { AiOutlineRedo } from "react-icons/ai";
import React, { useState } from "react";

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

  // Continue handler
  async function continueStory(payload) {
    setLoading(true); // start loading
    try {
      const response = await fetch(`${API_BASE}/story`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // check if an error occurred
      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
        setLoading(false);
        return;
      }

      const data = await response.json();
      // unpack the [ { story }, { image } ] response array
      const [storyObj, imageObj] = data;

      // only push if there's something to go back to
      if (story && imageUrl) {
        // include the prompt that generated this chunk
        setHistoryStack((stack) => [
          ...stack,
          { story, imageUrl, prompt: lastPrompt },
        ]);
      }

      // set new story and image
      setStory(storyObj.story);
      setImageUrl(imageObj.image);
    } catch (error) {
      console.error("Error fetching story:", error);
    } finally {
      setLoading(false); // stop loading
    }
  }

  // Regenerate handler
  async function regenerateStory() {
    if (!lastPrompt || loading) return;
    setLoading(true);
    try {
      // 1) Instruct server to drop the current chunk
      await fetch(`${API_BASE}/undo`, { method: "POST" });

      // 2) Re-POST the exact same payload to /story
      const response = await fetch(`${API_BASE}/story`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lastPrompt),
      });
      const data = await response.json();
      const [storyObj, imageObj] = data;

      // 3) Update UI with regenerated chunk
      setStory(storyObj.story);
      setImageUrl(imageObj.image);
    } catch (error) {
      console.error("Error regenerating story:", error);
    } finally {
      setLoading(false);
    }
  }

  // Undo handler
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
      // handle error from server
      console.error("Error undoing on server:", error);
      alert("Error undoing last action. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // New Story handler
  async function resetStory() {
    try {
      // tell server to wipe its history first
      await fetch(`${API_BASE}/new`, { method: "POST" });

      // only after server confirms, clear all client state
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
        <div className="loading">{/* <p>Generating story & image…</p> */}</div>
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

      <footer>© 2025 Elena Parapounsky. All rights reserved.</footer>
    </div>
  );
}

export default App;
