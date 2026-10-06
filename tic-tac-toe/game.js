const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],            // diagonals
];

// Returns { winner, line } if someone has won, "draw" if the board is full, or null.
function getResult(board) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return board.every(Boolean) ? "draw" : null;
}

if (typeof module !== "undefined") {
  module.exports = { getResult, WIN_LINES };
}

if (typeof document !== "undefined") {
  const boardEl = document.getElementById("board");
  const statusEl = document.getElementById("status");
  const scoreEls = {
    X: document.getElementById("score-x"),
    O: document.getElementById("score-o"),
    draw: document.getElementById("score-draw"),
  };
  const scores = { X: 0, O: 0, draw: 0 };
  let board, current, gameOver;
  let starter = "X";

  const cells = Array.from({ length: 9 }, (_, i) => {
    const cell = document.createElement("button");
    cell.className = "cell";
    cell.setAttribute("aria-label", `Cell ${i + 1}`);
    cell.addEventListener("click", () => play(i));
    boardEl.appendChild(cell);
    return cell;
  });

  function newGame() {
    board = Array(9).fill(null);
    current = starter;
    starter = starter === "X" ? "O" : "X"; // alternate who goes first
    gameOver = false;
    cells.forEach((cell) => {
      cell.textContent = "";
      cell.className = "cell";
      cell.disabled = false;
    });
    statusEl.textContent = `Player ${current}'s turn`;
  }

  function play(i) {
    if (gameOver || board[i]) return;
    board[i] = current;
    cells[i].textContent = current;
    cells[i].classList.add(current.toLowerCase());
    cells[i].disabled = true;

    const result = getResult(board);
    if (result === "draw") {
      endGame("It's a draw!", "draw");
    } else if (result) {
      result.line.forEach((j) => cells[j].classList.add("win"));
      endGame(`Player ${result.winner} wins!`, result.winner);
    } else {
      current = current === "X" ? "O" : "X";
      statusEl.textContent = `Player ${current}'s turn`;
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
    starter = "X";
    newGame();
  });

  newGame();
}
