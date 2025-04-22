import './App.css';
import { IoMdArrowForward } from "react-icons/io";
import { BiUndo } from "react-icons/bi";
import { AiOutlineRedo } from "react-icons/ai";

function App() {
  return (
    <div className="App">
      {/* <header className="App-header">
        <p>Infinite Story Generator</p>
      </header> */}

      <h1>Infinite Story Generator</h1>

      <textarea placeholder="Type your next prompt here..."></textarea>

      <div className="buttons">
        <button>Continue <IoMdArrowForward /> </button>
        <button>Undo <BiUndo /> </button>
        <button>Regenerate <AiOutlineRedo /> </button>
      </div>

      <footer>© 2025 Infinite Story Generator. Created by Vincent Le & Elena Parapounsky.</footer>
    </div>
  );
}

export default App;
