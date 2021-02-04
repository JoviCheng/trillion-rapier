import React, { useEffect, useRef, useState } from "react";
import { RootState, RootDispatch } from "./model";
import init from "./utils/init";
import { useRematch } from "./utils/useRematch";
import { RewardType } from "./types/";

import "./App.css";

const mapState = (state: RootState) => ({
  ...state.main,
  loading: state.loading,
});

const mapDispatch = (dispatch: RootDispatch) => ({
  ...dispatch.main,
});

function App() {
  const [{ score, ball, hitsCount }, { updataScore, setFields }] = useRematch(
    mapState,
    mapDispatch
  );
  const containerRef = useRef(null);

  // const [score, setScore] = useState(0);

  useEffect(() => {
    init(containerRef, updataScore, setFields);
  }, []);
  return (
    <div className="App">
      <div className="score">{score}</div>
      <div className="score2">{JSON.stringify(ball.speed)}</div>
      <div className="score3">HITS</div>
      <div className="score3">PEG:{hitsCount.peg}</div>
      <div className="score3">BOTTOM:{JSON.stringify(hitsCount.bottom)}</div>
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
