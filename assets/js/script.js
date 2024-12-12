// Full implementation of the enhanced Snake game with requested features and fixes.

/**
 * GAME CONSTANTS AND INITIAL SETUP
 */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Canvas dimensions
canvas.width = 800;
canvas.height = 600;
adjustCanvasHeight(); // Adjust canvas height on load

// Grid size
const GRID_SIZE = 20;

// Game states
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
let isPaused = false; // Pause state

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
const pausePlayButton = document.getElementById("pausePlayButton"); // Pause/Play button

// State to track modal visibility
let isModalOpen = false;

/**
 * UTILITY FUNCTIONS
 * - Random coordinate generator
 * - Screen wrapping logic
 * - Obstacle and special food generation
 */
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
    color: "#39FF14", // Neon green color for visibility
  };
  startSpecialFoodTimer();
}

function startSpecialFoodTimer() {
  if (specialFoodTimer) clearTimeout(specialFoodTimer);
  specialFoodTimer = setTimeout(() => {
    specialFood = null; // Remove special food after 6 seconds
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

/**
 * CORE GAME LOGIC
 * - Game loop
 * - Update and movement logic
 * - Collision detection
 * - Level progression
 */
function gameLoop() {
  if (!isModalOpen && !isPaused) {
    setTimeout(() => {
      update();
      draw();
      if (lives > 0) gameLoop();
    }, speed);
  } else if (isPaused) {
    drawPaused(); // Show paused screen
  }
}

function update() {
  // Update direction before moving the snake
  direction = { ...nextDirection };

  moveSnake();

  // Check if the snake eats the food
  const head = snake[0];
  if (head.x === food.x && head.y === food.y) {
    score += 100;
    if (score >= 1000 * level) {
      levelUp();
    }
    food = { x: randomCoord(canvas.width), y: randomCoord(canvas.height) };
  } else {
    snake.pop(); // Remove the tail
  }

  // Check if the snake eats special food
  if (specialFood && head.x === specialFood.x && head.y === specialFood.y) {
    score += 500; // Extra points for special food
    specialFood = null; // Remove special food
    clearTimeout(specialFoodTimer); // Clear timer if eaten
  }

  // Check for collisions with itself
  if (snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
    lives--; // Decrease lives
    updateLivesDisplay();

    if (lives > 0) {
      showLifeModal();
    } else {
      showGameOverModal();
    }
  }

  // Check for collisions with obstacles
  if (obstacles.some(obstacle => obstacle.x === head.x && obstacle.y === head.y)) {
    lives--;
    updateLivesDisplay();

    if (lives > 0) {
      showLifeModal();
    } else {
      showGameOverModal();
    }
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
  speed = Math.max(50, speed - 10); // Increase speed

  announceLevel(level); // Announce the new level

  // Add obstacles starting at level 3 and every 3 levels afterward
  if (level >= 3 && level % 3 === 0) {
    generateObstacles(5); // Add 5 obstacles per interval
  }

  // Add special food starting at level 2
  if (level >= 2 && !specialFood) {
    generateSpecialFood();
  }

  // Change snake skin every 5 levels
  if (level % 5 === 0) {
    snakeSkin = level % 10 === 0 ? "rainbow" : "golden"; // Alternate skins
  }
}

function resetSnake() {
  snake = [{ x: 300, y: 300 }];
  direction = { x: 0, y: 0 };
  nextDirection = { x: 0, y: 0 };
}

/**
 * MODAL AND UI FUNCTIONS
 * - Show/hide life lost and game over modals
 * - Update displayed stats
 */
function showGameOverModal() {
  isModalOpen = true;
  highScore = Math.max(highScore, score);
  highScoreDisplay.textContent = `High Score: ${highScore}`;
  gameOverModal.style.display = "flex";
}

restartButton.addEventListener("click", () => {
  score = 0;
  level = 1;
  lives = 3;
  speed = 150;
  obstacles = [];
  specialFood = null;
  snake = [{ x: 300, y: 300 }];
  direction = { x: 0, y: 0 };
  nextDirection = { x: 0, y: 0 };
  updateLivesDisplay();
  gameOverModal.style.display = "none";
  isModalOpen = false;
  isPaused = false; // Ensure game is not paused
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
  gameLoop();
});

function updateLivesDisplay() {
  livesDisplay.textContent = `Lives: ${"❤️".repeat(lives)}${"💔".repeat(3 - lives)}`;
}

/**
 * DRAWING FUNCTIONS
 * - Render snake, food, obstacles, and stats on the canvas
 */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw obstacles
  ctx.fillStyle = "#654321";
  obstacles.forEach(obstacle => {
    ctx.fillRect(obstacle.x, obstacle.y, GRID_SIZE, GRID_SIZE);
  });

  // Draw the snake
  ctx.fillStyle = snakeSkin === "golden" ? "#FFD700" : snakeSkin === "rainbow" ? "#FF4500" : "#39ff14";
  snake.forEach(segment => {
    ctx.fillRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);
  });

  // Draw food
  ctx.fillStyle = "#ff4500";
  ctx.fillRect(food.x, food.y, GRID_SIZE, GRID_SIZE);

  // Draw special food
  if (specialFood) {
    ctx.fillStyle = specialFood.color;
    ctx.globalAlpha = 0.6 + 0.4 * Math.sin(Date.now() / 200); // Flashing effect
    ctx.fillRect(specialFood.x, specialFood.y, GRID_SIZE, GRID_SIZE);
    ctx.globalAlpha = 1.0; // Reset alpha
  }

  // Display stats
  scoreDisplay.textContent = `Score: ${score}`;
  levelDisplay.textContent = `Level: ${level}`;
  highScoreDisplay.textContent = `High Score: ${highScore}`;
}

/**
 * PAUSED SCREEN DRAWING
 */
function drawPaused() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; // Dim the background
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#FFD700"; // Retro-style yellow text
  ctx.font = "bold 48px 'Press Start 2P', sans-serif"; // Retro font
  ctx.textAlign = "center";
  ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
}

/**
 * EVENT LISTENERS
 * - Handle keyboard input for snake movement
 */
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
      // Spacebar to toggle pause/play
      if (isPaused) {
        isPaused = false;
        pausePlayButton.textContent = "Pause";
        gameLoop();
      } else {
        isPaused = true;
        pausePlayButton.textContent = "Play";
      }
      break;
  }
});

/**
 * TOUCH CONTROLS FOR MOBILE DEVICES
 */
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener("touchstart", event => {
  const touch = event.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});

document.addEventListener("touchmove", event => {
  if (event.touches.length > 1) return; // Ignore multi-touch
  const touch = event.touches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal swipe
    if (dx > 0 && direction.x === 0) nextDirection = { x: 1, y: 0 }; // Right
    if (dx < 0 && direction.x === 0) nextDirection = { x: -1, y: 0 }; // Left
  } else {
    // Vertical swipe
    if (dy > 0 && direction.y === 0) nextDirection = { x: 0, y: 1 }; // Down
    if (dy < 0 && direction.y === 0) nextDirection = { x: 0, y: -1 }; // Up
  }

  touchStartX = touch.clientX; // Reset for next swipe
  touchStartY = touch.clientY;
});

/**
 * PAUSE/PLAY LOGIC
 */
pausePlayButton.addEventListener("click", () => {
  if (isPaused) {
    isPaused = false; // Resume the game
    pausePlayButton.textContent = "Pause"; // Change button to Pause
    gameLoop();
  } else {
    isPaused = true; // Pause the game
    pausePlayButton.textContent = "Play"; // Change button to Play
  }
});

/**
 * DYNAMIC CANVAS HEIGHT FOR SMALL SCREENS
 */
function adjustCanvasHeight() {
  if (window.innerWidth <= 768) {
    canvas.height = window.innerHeight * 1.2; // Set to 90% of viewport height
  } else {
    canvas.height = 600; // Default height for larger screens
  }
}

// Adjust canvas height on window resize
window.addEventListener("resize", adjustCanvasHeight);

/**
 * START GAME
 * - Initialize game state and start the game loop
 */
resetSnake();
updateLivesDisplay();
gameLoop();
















