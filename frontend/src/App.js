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

  // fetch logic for Continue
  async function continueStory(payload) {
    setLoading(true); // start loading
    try {
      const response = await fetch("http://localhost:5000/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      // unpack the [ { story }, { image } ] response array
      const [storyObj, imageObj] = data;

      // push previous state onto undo stack
      setHistoryStack((stack) => [...stack, { story, imageUrl }]);

      // set new story and image
      setStory(storyObj.story);
      setImageUrl(imageObj.image);
    } catch (error) {
      console.error("Error fetching story:", error);
    } finally {
      setLoading(false); // stop loading
    }
  }

  // fetch logic for Regenerate
  async function regenerateStory() {
    try {
      const response = await fetch("http://localhost:5000/regenerate", {
        method: "POST",
      });

      const data = await response.json();
      // unpack the [ { story }, { image } ] response array
      const [storyObj, imageObj] = data;

      // push previous state onto undo stack
      setHistoryStack((stack) => [...stack, { story, imageUrl }]);

      // set new story and image
      setStory(storyObj.story);
      setImageUrl(imageObj.image);
    } catch (error) {
      console.error("Error regenerating story:", error);
    }
  }

  // reset state to start a new story
  function resetStory() {
    setStory("");
    setImageUrl("");
    setHistoryStack([]);
    setPrompt("");
    setLastPrompt(null);
  }

  return (
    <div className="App">
      <div className="header">
        <h1>Infinite Story Generator</h1>
        <button id="new-story" onClick={resetStory} disabled={loading}>
          New Story
        </button>
      </div>

      <div className="dropdowns">
        <select value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option value="" disabled hidden>
            Genre
          </option>
          <option value="fantasy">Fantasy</option>
          <option value="sci-fi">Sci-Fi</option>
          <option value="mystery">Mystery</option>
          <option value="romance">Romance</option>
          <option value="horror">Horror</option>
        </select>

        <select value={tone} onChange={(e) => setTone(e.target.value)}>
          <option value="" disabled hidden>
            Tone
          </option>
          <option value="lighthearted">Lighthearted</option>
          <option value="serious">Serious</option>
          <option value="dark">Dark</option>
          <option value="humorous">Humorous</option>
        </select>

        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="" disabled hidden>
            Theme
          </option>
          <option value="friendship">Friendship</option>
          <option value="adventure">Adventure</option>
          <option value="revenge">Revenge</option>
          <option value="coming-of-age">Coming of Age</option>
          <option value="survival">Survival</option>
        </select>
      </div>

      {/* loading indicator */}
      {loading && (
        <div className="loading">
          <p>Generating story & image…</p>
        </div>
      )}

      {/* display generated image if available */}
      {imageUrl && (
        <div className="image">
          <img src={imageUrl} alt="Illustration for story" />
        </div>
      )}

      <div className="story" id="story">
        {story && (
          <p>
            {story}
            <span className="ellipsis"> . . .</span>
          </p>
        )}
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
        >
          Continue <IoMdArrowForward />
        </button>

        {/* undo button pops last state from history */}
        <button
          onClick={() => {
            setHistoryStack((stack) => {
              if (stack.length === 0) return stack;
              const prev = stack[stack.length - 1];
              setStory(prev.story);
              setImageUrl(prev.imageUrl);
              return stack.slice(0, -1);
            });
          }}
        >
          Undo <BiUndo />
        </button>

        {/* regenerate button reuses lastPrompt */}
        <button
          onClick={() => {
            // if (lastPrompt) regenerateStory(lastPrompt);
            regenerateStory();
          }}
        >
          Regenerate <AiOutlineRedo />
        </button>
      </div>

      <footer>
        © 2025 Infinite Story Generator. Created by Vincent Le & Elena
        Parapounsky.
      </footer>
    </div>
  );
}

export default App;
