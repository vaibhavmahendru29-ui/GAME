const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");
context.scale(20, 20);

// Tetris Shapes
function createPiece(type) {
  if (type === "T") return [[0, 0, 0],[1, 1, 1],[0, 1, 0]];
  if (type === "O") return [[2, 2],[2, 2]];
  if (type === "L") return [[0, 3, 0],[0, 3, 0],[0, 3, 3]];
  if (type === "J") return [[0, 4, 0],[0, 4, 0],[4, 4, 0]];
  if (type === "I") return [[5, 5, 5, 5]];
  if (type === "S") return [[0, 6, 6],[6, 6, 0]];
  if (type === "Z") return [[7, 7, 0],[0, 7, 7]];
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; y++) {
    for (let x = 0; x < m[y].length; x++) {
      if (m[y][x] !== 0 &&
        arena[y + o.y] &&
        arena[y + o.y][x + o.x] !== 0) {
        return true;
      }
    }
  }
  return false;
}

function arenaSweep() {
  let rowCount = 1;
  outer: for (let y = arena.length - 1; y >= 0; y--) {
    for (let x = 0; x < arena[y].length; x++) {
      if (arena[y][x] === 0) continue outer;
    }
    arena.splice(y, 1);
    arena.unshift(new Array(12).fill(0));
    score += rowCount * 10;
    rowCount *= 2;
  }
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < y; x++) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (dir > 0) matrix.forEach(row => row.reverse());
  else matrix.reverse();
}

function playerReset() {
  const pieces = "TOLJISZ";
  player.matrix = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
  player.pos.y = 0;
  player.pos.x = Math.floor((arena[0].length - player.matrix[0].length) / 2);

  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    score = 0;
    updateScore();
  }
}

function draw() {
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
}

function update(time = 0) {
  if (!isPlaying) return;

  const delta = time - lastTime;
  lastTime = time;

  dropCounter += delta;
  if (dropCounter > dropInterval) {
    playerDrop();
  }
  draw();
  requestAnimationFrame(update);
}

function updateScore() {
  document.getElementById("score").innerText = score;
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
  }
  dropCounter = 0;
}

// Controls
document.addEventListener("keydown", (event) => {
  if (!isPlaying) return;

  if (event.key === "ArrowLeft") {
    player.pos.x--;
    if (collide(arena, player)) player.pos.x++;
  } else if (event.key === "ArrowRight") {
    player.pos.x++;
    if (collide(arena, player)) player.pos.x--;
  } else if (event.key === "ArrowDown") {
    playerDrop();
  } else if (event.key === "ArrowUp") {
    rotate(player.matrix, 1);
    if (collide(arena, player)) rotate(player.matrix, -1);
  }
});

// Play / Pause
document.getElementById("playBtn").onclick = () => {
  isPlaying = !isPlaying;
  if (isPlaying) update();
};

// Game variables
const colors = [
  null,
  "purple", "yellow", "orange", "blue",
  "cyan", "green", "red"
];

const arena = Array.from({ length: 20 }, () => new Array(12).fill(0));

let dropCounter = 0;
let dropInterval = 700;
let lastTime = 0;
let score = 0;
let isPlaying = false;

const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
};

// Start game
playerReset();
draw();
