import React from "react";
import TrillonRapier from "./components/TrillonRapier";
import { RootState } from "./model";
import { useRematch } from "./utils/useRematch";

import "./App.css";

const mapState = (state: RootState) => ({
  ...state.main,
  loading: state.loading,
});

function App() {
  const [{ totalScore, ball, hitsCount, round }] = useRematch(mapState);

  return (
    <div className="App">
      <div className="score">totalScore: {totalScore}</div>
      <div className="score2">baseHit: {round.baseHit}</div>
      {/* <div className="score2">{JSON.stringify(ball.speed)}</div> */}
      {/* <div className="score3">HITS</div> */}
      {/* <div className="score3">PEG:{hitsCount.peg}</div> */}
      {/* <div className="score3">BOTTOM:{JSON.stringify(hitsCount.bottom)}</div> */}
      <div className="score2">round: {JSON.stringify(round)}</div>
      <TrillonRapier />
    </div>
  );
}

export default App;
