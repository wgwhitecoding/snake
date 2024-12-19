// =======================================
// ************ GAME CONSTANTS ************
// =======================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Canvas dimensions
canvas.width = 800;
canvas.height = 600;
adjustCanvasHeight(); // Adjust canvas height on load

// Grid size
const GRID_SIZE = 20;

// Game state variables
let snake = [{ x: 300, y: 300 }];
let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };
let food = { x: randomCoord(canvas.width), y: randomCoord(canvas.height) };
let score = 0;
let level = 1;
let speed = 150;
let lives = 3;
let obstacles = [];
let specialFood = null;
let specialFoodTimer = null;
let snakeSkin = "default";
let highScore = 0;
let isPaused = false; 
let isModalOpen = false; 
let justRespawned = false; // NEW FLAG

// DOM elements
const scoreDisplay = document.getElementById("scoreDisplay");
const levelDisplay = document.getElementById("levelDisplay");
const livesDisplay = document.getElementById("livesDisplay");
const highScoreDisplay = document.getElementById("highScoreDisplay");
const lifeModal = document.getElementById("lifeModal");
const gameOverModal = document.getElementById("gameOverModal");
const remainingLives = document.getElementById("remainingLives");
const resumeButton = document.getElementById("resumeButton");
const restartButton = document.getElementById("restartButton");
const pausePlayButton = document.getElementById("pausePlayButton");

// Initial UI updates
updateLivesDisplay();

// =======================================
// ************ UTILITY FUNCTIONS *********
// =======================================
function randomCoord(max) {
  return GRID_SIZE * Math.floor(Math.random() * (max / GRID_SIZE));
}

function wrapAround(coord, max) {
  if (coord < 0) return max - GRID_SIZE;
  if (coord >= max) return 0;
  return coord;
}

function generateObstacles(count) {
  for (let i = 0; i < count; i++) {
    obstacles.push({
      x: randomCoord(canvas.width),
      y: randomCoord(canvas.height),
    });
  }
}

function generateSpecialFood() {
  specialFood = {
    x: randomCoord(canvas.width),
    y: randomCoord(canvas.height),
    color: "#39FF14",
  };
  startSpecialFoodTimer();
}

function startSpecialFoodTimer() {
  if (specialFoodTimer) clearTimeout(specialFoodTimer);
  specialFoodTimer = setTimeout(() => {
    specialFood = null;
  }, 6000);
}

function announceLevel(level) {
  const levelAnnouncement = document.createElement("div");
  levelAnnouncement.textContent = `Level ${level}!`;
  levelAnnouncement.style = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 4em;
    color: #FFD700;
    text-shadow: 0 0 20px #FFD700;
    animation: flash 1.5s ease-in-out 3;
  `;
  document.body.appendChild(levelAnnouncement);
  setTimeout(() => levelAnnouncement.remove(), 3000);
}

// =======================================
// ************* CORE GAME LOGIC **********
// =======================================
function gameLoop() {
  if (!isModalOpen && !isPaused && lives > 0) {
    setTimeout(() => {
      update();
      draw();
      gameLoop();
    }, speed);
  } else if (isPaused) {
    drawPaused();
  }
}

function update() {
  // If we just respawned, skip collision checks once
  if (justRespawned) {
    justRespawned = false;
    // Skip movement/collision checks this frame
    return;
  }

  direction = { ...nextDirection };

  // If direction is (0,0), no movement or collision checks occur.
  if (direction.x === 0 && direction.y === 0) {
    return;
  }

  moveSnake();

  const head = snake[0];

  // Check if snake eats normal food
  if (head.x === food.x && head.y === food.y) {
    score += 100;
    if (score >= 1000 * level) {
      levelUp();
    }
    food = { x: randomCoord(canvas.width), y: randomCoord(canvas.height) };
  } else {
    snake.pop();
  }

  // Check if snake eats special food
  if (specialFood && head.x === specialFood.x && head.y === specialFood.y) {
    score += 500; 
    specialFood = null; 
    clearTimeout(specialFoodTimer); 
  }

  // Collision with itself
  if (snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
    handleLifeLoss();
    return; 
  }

  // Collision with obstacles
  if (obstacles.some(obstacle => obstacle.x === head.x && obstacle.y === head.y)) {
    handleLifeLoss();
    return; 
  }
}

function moveSnake() {
  const head = {
    x: wrapAround(snake[0].x + direction.x * GRID_SIZE, canvas.width),
    y: wrapAround(snake[0].y + direction.y * GRID_SIZE, canvas.height),
  };
  snake.unshift(head);
}

function levelUp() {
  level++;
  speed = Math.max(50, speed - 10);
  announceLevel(level);

  if (level >= 3 && level % 3 === 0) {
    generateObstacles(5);
  }

  if (level >= 2 && !specialFood) {
    generateSpecialFood();
  }

  if (level % 5 === 0) {
    snakeSkin = level % 10 === 0 ? "rainbow" : "golden";
  }
}

// =======================================
// ********** LIFE LOSS & REPOSITION ******
// =======================================
function handleLifeLoss() {
  lives--;
  updateLivesDisplay();

  if (lives > 0) {
    showLifeModal();
  } else {
    showGameOverModal();
  }
}

/**
 * Reposition the snake at a guaranteed safe location.
 * We'll place the snake horizontally at y=0, starting around x=300 and going left.
 * We remove obstacles that might occupy that space.
 */
function repositionSnake() {
  const headY = 0;
  const headX = 300; 

  // Compute the snake positions in a straight line going left from (300,0)
  const snakePositions = [];
  for (let i = 0; i < snake.length; i++) {
    snakePositions.push({ x: headX - i * GRID_SIZE, y: headY });
  }

  // Remove obstacles on that line
  obstacles = obstacles.filter(ob => {
    return !snakePositions.some(sp => sp.x === ob.x && sp.y === ob.y);
  });

  // Place snake segments
  for (let i = 0; i < snake.length; i++) {
    snake[i].x = headX - i * GRID_SIZE;
    snake[i].y = headY;
  }

  // Stop all movement until player chooses direction
  direction = { x: 0, y: 0 };
  nextDirection = { x: 0, y: 0 };
  justRespawned = true;
}

// =======================================
// *************** MODAL & UI *************
// =======================================
function showGameOverModal() {
  isModalOpen = true;
  highScore = Math.max(highScore, score);
  highScoreDisplay.textContent = `High Score: ${highScore}`;
  gameOverModal.style.display = "flex";
}

restartButton.addEventListener("click", () => {
  resetGame();
  gameOverModal.style.display = "none";
  isModalOpen = false;
  isPaused = false;
  gameLoop();
});

function showLifeModal() {
  isModalOpen = true;
  remainingLives.textContent = `Lives: ${"❤️".repeat(lives)}${"💔".repeat(3 - lives)}`;
  lifeModal.style.display = "flex";
}

resumeButton.addEventListener("click", () => {
  lifeModal.style.display = "none";
  isModalOpen = false;

  repositionSnake(); 
  // After repositioning, we do not move, justRespawned = true so no collision checks next frame.
  gameLoop();
});

function updateLivesDisplay() {
  livesDisplay.textContent = `Lives: ${"❤️".repeat(lives)}${"💔".repeat(3 - lives)}`;
}

function resetGame() {
  score = 0;
  level = 1;
  lives = 3;
  speed = 150;
  obstacles = [];
  specialFood = null;
  snake = [{ x: 300, y: 300 }];
  direction = { x: 0, y: 0 };
  nextDirection = { x: 0, y: 0 };
  justRespawned = false;
  updateLivesDisplay();
}

// =======================================
// ************ DRAW FUNCTIONS ************
// =======================================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw obstacles
  ctx.fillStyle = "#654321";
  obstacles.forEach(obstacle => {
    ctx.fillRect(obstacle.x, obstacle.y, GRID_SIZE, GRID_SIZE);
  });

  // Draw the snake
  ctx.fillStyle = snakeSkin === "golden" ? "#FFD700"
                : snakeSkin === "rainbow" ? "#FF4500"
                : "#39ff14";
  snake.forEach(segment => {
    ctx.fillRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);
  });

  // Draw normal food
  ctx.fillStyle = "#ff4500";
  ctx.fillRect(food.x, food.y, GRID_SIZE, GRID_SIZE);

  // Draw special food if present
  if (specialFood) {
    ctx.fillStyle = specialFood.color;
    ctx.globalAlpha = 0.6 + 0.4 * Math.sin(Date.now() / 200);
    ctx.fillRect(specialFood.x, specialFood.y, GRID_SIZE, GRID_SIZE);
    ctx.globalAlpha = 1.0;
  }

  scoreDisplay.textContent = `Score: ${score}`;
  levelDisplay.textContent = `Level: ${level}`;
  highScoreDisplay.textContent = `High Score: ${highScore}`;
}

function drawPaused() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#FFD700";
  ctx.font = "bold 48px 'Press Start 2P', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
}

// =======================================
// ********** EVENT LISTENERS *************
// =======================================
document.addEventListener("keydown", event => {
  switch (event.key) {
    case "ArrowUp":
      if (direction.y === 0) nextDirection = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      if (direction.y === 0) nextDirection = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      if (direction.x === 0) nextDirection = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      if (direction.x === 0) nextDirection = { x: 1, y: 0 };
      break;
    case " ":
      togglePause();
      break;
  }
});

// Touch controls for mobile
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener("touchstart", event => {
  const touch = event.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});

document.addEventListener("touchmove", event => {
  if (event.touches.length > 1) return; 
  const touch = event.touches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && direction.x === 0) nextDirection = { x: 1, y: 0 };
    if (dx < 0 && direction.x === 0) nextDirection = { x: -1, y: 0 };
  } else {
    if (dy > 0 && direction.y === 0) nextDirection = { x: 0, y: 1 };
    if (dy < 0 && direction.y === 0) nextDirection = { x: 0, y: -1 };
  }

  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});

// Pause/Play button
pausePlayButton.addEventListener("click", togglePause);

function togglePause() {
  if (isPaused) {
    isPaused = false;
    pausePlayButton.textContent = "Pause";
    if (!isModalOpen && lives > 0) {
      gameLoop();
    }
  } else {
    isPaused = true;
    pausePlayButton.textContent = "Play";
    drawPaused();
  }
}

// =======================================
// ********** RESPONSIVE CANVAS ***********
// =======================================
function adjustCanvasHeight() {
  if (window.innerWidth <= 768) {
    canvas.height = window.innerHeight * 1.2; 
  } else {
    canvas.height = 600;
  }
}

window.addEventListener("resize", adjustCanvasHeight);

// =======================================
// ************ START THE GAME ************
// =======================================
gameLoop();

















