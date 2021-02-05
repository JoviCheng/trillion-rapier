import React from "react";
import TrillonRapier from "./components/TrillonRapier";
import { RootState, RootDispatch } from "./model";
import { useRematch } from "./utils/useRematch";

import "./App.css";

const mapState = (state: RootState) => ({
  ...state.main,
  loading: state.loading,
});

const mapDispatch = (dispatch: RootDispatch) => ({
  ...dispatch.main,
});

function App() {
  const [{ score, ball, baseHit, hitsCount }, {}] = useRematch(
    mapState,
    mapDispatch
  );

  return (
    <div className="App">
      <div className="score">{score}</div>
      <div className="score2">baseHit:{baseHit}</div>
      <div className="score2">{JSON.stringify(ball.speed)}</div>
      <div className="score3">HITS</div>
      <div className="score3">PEG:{hitsCount.peg}</div>
      <div className="score3">BOTTOM:{JSON.stringify(hitsCount.bottom)}</div>
      <TrillonRapier />
    </div>
  );
}

export default App;
