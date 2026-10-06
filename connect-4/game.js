const ROWS = 6;
const COLS = 7;
const DIRECTIONS = [
  [0, 1],  // horizontal
  [1, 0],  // vertical
  [1, 1],  // diagonal down-right
  [1, -1], // diagonal down-left
];

// board is a flat array of ROWS * COLS, row 0 at the top.
// Returns the index a disc dropped in `col` would land in, or -1 if the column is full.
function dropRow(board, col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (!board[r * COLS + col]) return r * COLS + col;
  }
  return -1;
}

// Returns { winner, line } if someone has four in a row, "draw" if the board is full, or null.
function getResult(board) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const player = board[r * COLS + c];
      if (!player) continue;
      for (const [dr, dc] of DIRECTIONS) {
        const line = [];
        for (let k = 0; k < 4; k++) {
          const rr = r + dr * k;
          const cc = c + dc * k;
          if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS) break;
          if (board[rr * COLS + cc] !== player) break;
          line.push(rr * COLS + cc);
        }
        if (line.length === 4) return { winner: player, line };
      }
    }
  }
  return board.every(Boolean) ? "draw" : null;
}

if (typeof module !== "undefined") {
  module.exports = { getResult, dropRow, ROWS, COLS };
}

if (typeof document !== "undefined") {
  const boardEl = document.getElementById("board");
  const statusEl = document.getElementById("status");
  const scoreEls = {
    red: document.getElementById("score-red"),
    yellow: document.getElementById("score-yellow"),
    draw: document.getElementById("score-draw"),
  };
  const names = { red: "Red", yellow: "Yellow" };
  const scores = { red: 0, yellow: 0, draw: 0 };
  let board, current, gameOver;
  let starter = "red";

  // Clicking any cell drops a disc into that cell's column.
  const cells = Array.from({ length: ROWS * COLS }, (_, i) => {
    const cell = document.createElement("button");
    cell.className = "cell";
    cell.setAttribute("aria-label", `Column ${(i % COLS) + 1}`);
    cell.addEventListener("click", () => play(i % COLS));
    boardEl.appendChild(cell);
    return cell;
  });

  function newGame() {
    board = Array(ROWS * COLS).fill(null);
    current = starter;
    starter = starter === "red" ? "yellow" : "red"; // alternate who goes first
    gameOver = false;
    cells.forEach((cell) => {
      cell.className = "cell";
      cell.disabled = false;
    });
    statusEl.textContent = `${names[current]}'s turn`;
  }

  function play(col) {
    if (gameOver) return;
    const i = dropRow(board, col);
    if (i === -1) return; // column is full
    board[i] = current;
    cells[i].classList.add(current);

    const result = getResult(board);
    if (result === "draw") {
      endGame("It's a draw!", "draw");
    } else if (result) {
      result.line.forEach((j) => cells[j].classList.add("win"));
      endGame(`${names[result.winner]} wins!`, result.winner);
    } else {
      current = current === "red" ? "yellow" : "red";
      statusEl.textContent = `${names[current]}'s turn`;
    }
  }

  function endGame(message, key) {
    gameOver = true;
    statusEl.textContent = message;
    scores[key]++;
    scoreEls[key].textContent = scores[key];
    cells.forEach((cell) => (cell.disabled = true));
  }

  document.getElementById("new-game").addEventListener("click", newGame);
  document.getElementById("reset-scores").addEventListener("click", () => {
    Object.keys(scores).forEach((k) => {
      scores[k] = 0;
      scoreEls[k].textContent = "0";
    });
    starter = "red";
    newGame();
  });

  newGame();
}
