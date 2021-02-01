import React, { useEffect, useRef } from "react";
import init from "./utils/init";
import "./App.css";

function App() {
  const containerRef = useRef(null);

  useEffect(() => {
    init(containerRef);
  }, []);
  return (
    <div className="App">
      <div className="container" ref={containerRef}>
        <div className="score current-score">
          score<span></span>
        </div>
        <div className="score high-score">
          total score<span></span>
        </div>
      </div>
    </div>
  );
}

export default App;
