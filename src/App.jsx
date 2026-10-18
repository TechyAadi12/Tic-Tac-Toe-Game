import React, { useEffect, useMemo, useState } from "react";

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function getWinner(board) {
  for (const line of WINNING_LINES) {
    const [first, second, third] = line;
    if (board[first] && board[first] === board[second] && board[first] === board[third]) {
      return { mark: board[first], line };
    }
  }
  return null;
}

function getBestMove(board) {
  const winningLine = getWinner(board);
  if (winningLine || board.every(Boolean)) return -1;

  const minimax = (position, isMaximizing) => {
    const result = getWinner(position);
    if (result?.mark === "O") return 10;
    if (result?.mark === "X") return -10;
    if (position.every(Boolean)) return 0;

    let bestScore = isMaximizing ? -Infinity : Infinity;
    for (let index = 0; index < position.length; index += 1) {
      if (position[index]) continue;
      position[index] = isMaximizing ? "O" : "X";
      const score = minimax(position, !isMaximizing);
      position[index] = null;
      bestScore = isMaximizing ? Math.max(score, bestScore) : Math.min(score, bestScore);
    }
    return bestScore;
  };

  let bestScore = -Infinity;
  let bestMoves = [];
  for (let index = 0; index < board.length; index += 1) {
    if (board[index]) continue;
    board[index] = "O";
    const score = minimax(board, false);
    board[index] = null;
    if (score > bestScore) {
      bestScore = score;
      bestMoves = [index];
    } else if (score === bestScore) {
      bestMoves.push(index);
    }
  }
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

function Mark({ value, small = false }) {
  if (!value) return null;
  return (
    <span className={`mark mark-${value.toLowerCase()}${small ? " mark-small" : ""}`} aria-hidden="true">
      {value === "X" ? (
        <svg viewBox="0 0 48 48" fill="none">
          <path d="M10 10l28 28M38 10L10 38" />
        </svg>
      ) : (
        <svg viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="15" />
        </svg>
      )}
    </span>
  );
}

function App() {
  const [mode, setMode] = useState("friend");
  const [board, setBoard] = useState(Array(9).fill(null));
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const result = useMemo(() => getWinner(board), [board]);
  const isDraw = !result && board.every(Boolean);
  const turn = board.filter(Boolean).length % 2 === 0 ? "X" : "O";
  const computerThinking = mode === "computer" && turn === "O" && !result && !isDraw;
  const roundOver = Boolean(result || isDraw);

  const recordRound = (nextBoard) => {
    const winner = getWinner(nextBoard);
    if (winner) {
      setScores((current) => ({ ...current, [winner.mark]: current[winner.mark] + 1 }));
    } else if (nextBoard.every(Boolean)) {
      setScores((current) => ({ ...current, draws: current.draws + 1 }));
    }
  };

  const playAt = (index) => {
    if (board[index] || roundOver || computerThinking) return;
    if (mode === "computer" && turn !== "X") return;
    const nextBoard = [...board];
    nextBoard[index] = turn;
    setBoard(nextBoard);
    recordRound(nextBoard);
  };

  useEffect(() => {
    if (!computerThinking) return undefined;
    const timeout = window.setTimeout(() => {
      const index = getBestMove([...board]);
      if (index < 0) return;
      const nextBoard = [...board];
      nextBoard[index] = "O";
      setBoard(nextBoard);
      recordRound(nextBoard);
    }, 520);
    return () => window.clearTimeout(timeout);
  }, [board, computerThinking]);

  const startRound = () => setBoard(Array(9).fill(null));
  const changeMode = (nextMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    setBoard(Array(9).fill(null));
    setScores({ X: 0, O: 0, draws: 0 });
  };

  let status;
  if (result) {
    status =
      mode === "computer"
        ? result.mark === "X"
          ? "You got this one!"
          : "The computer wins this round"
        : `${result.mark === "X" ? "Player X" : "Player O"} takes the round!`;
  } else if (isDraw) {
    status = "A perfectly matched draw";
  } else if (computerThinking) {
    status = "Computer is thinking…";
  } else if (mode === "computer") {
    status = "Your move — you’re X";
  } else {
    status = `Player ${turn}’s turn`;
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Tic-Tac-Toe home">
          <span className="brand-icon">
            <Mark value="X" small />
            <Mark value="O" small />
          </span>
          <span>Tic-Tac-Toe</span>
        </a>
        <div className="topbar-note">
          <span className="live-dot" />
          <span>A little friendly competition</span>
        </div>
        <a className="how-link" href="#how-to-play">How to play <span aria-hidden="true">↗</span></a>
      </header>

      <section className="game-layout" id="home">
        <div className="intro">
          <div className="eyebrow"><span>✳</span> THE CLASSIC, REIMAGINED</div>
          <h1>Make your<br /><span>move.</span></h1>
          <p className="intro-copy">Three in a row. One very satisfying victory.<br className="desktop-break" /> Ready when you are.</p>

          <div className="scoreboard" aria-label="Round scores">
            <div className={`score-card score-x${turn === "X" && !roundOver ? " is-active" : ""}`}>
              <div className="score-label">
                <Mark value="X" small />
                <span>{mode === "computer" ? "YOU" : "PLAYER X"}</span>
              </div>
              <strong>{scores.X}</strong>
              <span className="score-caption">wins</span>
            </div>
            <div className="score-divider"><span>VS</span></div>
            <div className={`score-card score-o${turn === "O" && !roundOver ? " is-active" : ""}`}>
              <div className="score-label">
                <Mark value="O" small />
                <span>{mode === "computer" ? "CPU" : "PLAYER O"}</span>
              </div>
              <strong>{scores.O}</strong>
              <span className="score-caption">wins</span>
            </div>
            <div className="draw-count"><span>Draws</span><strong>{scores.draws}</strong></div>
          </div>

          <div className="mode-control">
            <span className="mode-title">PLAY MODE</span>
            <div className="mode-switch" role="group" aria-label="Choose a game mode">
              <button className={mode === "friend" ? "selected" : ""} onClick={() => changeMode("friend")} aria-pressed={mode === "friend"}>
                <span aria-hidden="true">♟</span> With a friend
              </button>
              <button className={mode === "computer" ? "selected" : ""} onClick={() => changeMode("computer")} aria-pressed={mode === "computer"}>
                <span aria-hidden="true">✦</span> vs Computer
              </button>
            </div>
          </div>
        </div>

        <section className="game-card" aria-label="Tic tac toe game">
          <div className="game-card-top">
            <div>
              <span className="round-label">ROUND IN PROGRESS</span>
              <h2>{mode === "computer" ? "You vs. CPU" : "Your next classic"}</h2>
            </div>
            <div className="round-number"><span className="round-dot" /> LIVE</div>
          </div>

          <div className={`turn-status${roundOver ? " status-result" : ""}`} aria-live="polite" aria-atomic="true">
            <span className={`status-mark ${result ? `status-${result.mark.toLowerCase()}` : computerThinking ? "status-thinking" : `status-${turn.toLowerCase()}`}`}>
              {result ? <Mark value={result.mark} small /> : computerThinking ? <span className="thinking-dots">···</span> : <Mark value={turn} small />}
            </span>
            <span>{status}</span>
            {roundOver && <span className="status-sparkle" aria-hidden="true">✦</span>}
          </div>

          <div className="board" role="group" aria-label="Tic tac toe board">
            {board.map((cell, index) => {
              const isWinningCell = result?.line.includes(index);
              return (
                <button
                  className={`cell${cell ? ` cell-${cell.toLowerCase()}` : ""}${isWinningCell ? " winning-cell" : ""}`}
                  key={index}
                  aria-label={`Row ${Math.floor(index / 3) + 1}, column ${(index % 3) + 1}${cell ? `, ${cell}` : ", empty"}`}
                  aria-disabled={Boolean(cell || roundOver || computerThinking || (mode === "computer" && turn !== "X"))}
                  onClick={() => playAt(index)}
                >
                  <Mark value={cell} />
                  {!cell && !roundOver && !computerThinking && !(mode === "computer" && turn !== "X") && (
                    <span className={`cell-hint hint-${turn.toLowerCase()}`} aria-hidden="true"><Mark value={turn} small /></span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="game-card-footer">
            <span className="turn-hint"><span className="keyboard-key">✦</span> {mode === "computer" ? "Can you outsmart the CPU?" : "Take turns, make it count."}</span>
            <button className="new-round-button" onClick={startRound}>
              <span aria-hidden="true">↻</span> New round
            </button>
          </div>
        </section>
      </section>

      <footer className="page-footer" id="how-to-play">
        <span><span className="footer-sparkle">✳</span> SIMPLE RULES. SERIOUS BRAGGING RIGHTS.</span>
        <span className="footer-how"><strong>How to play</strong> Get three of your marks in a row to win.</span>
        <button className="reset-button" onClick={() => { startRound(); setScores({ X: 0, O: 0, draws: 0 }); }}>
          Reset scores <span aria-hidden="true">↗</span>
        </button>
      </footer>
    </main>
  );
}

export default App;
