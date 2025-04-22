import './App.css';

function App() {
  return (
    <div className="App">
      {/* <header className="App-header">
        <p>Infinite Story Generator</p>
      </header> */}

      <h1>Infinite Story Generator</h1>

      <textarea placeholder="Type your next prompt here..."></textarea>

      <button>Continue</button>
      <button>Undo</button>
      <button>Regenerate</button>

      <footer>© 2025 Infinite Story Generator. Created by Vincent Le & Elena Parapounsky.</footer>
    </div>
  );
}

export default App;
