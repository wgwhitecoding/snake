// Select the canvas and set up the context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Canvas dimensions (larger space)
canvas.width = 600;
canvas.height = 600;

// Grid size
const gridSize = 20;

// Snake settings
let snake = [{ x: 300, y: 300 }];
let direction = { x: 0, y: 0 };
let food = { x: gridSize * Math.floor(Math.random() * (canvas.width / gridSize)), y: gridSize * Math.floor(Math.random() * (canvas.height / gridSize)) };
let score = 0;
let level = 1;
let speed = 150; // Initial speed
let lives = 3;
let highScore = 0;

// DOM elements
const scoreDisplay = document.getElementById("scoreDisplay");
const levelDisplay = document.getElementById("levelDisplay");
const livesDisplay = document.getElementById("livesDisplay");
const highScoreDisplay = document.getElementById("highScoreDisplay");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const livesLeft = document.getElementById("livesLeft");
const restartButton = document.getElementById("restartButton");

// Game loop
function gameLoop() {
    setTimeout(() => {
        update();
        draw();
        if (lives > 0) gameLoop();
    }, speed);
}

// Update game state
function update() {
    // Move the snake
    const head = { x: snake[0].x + direction.x * gridSize, y: snake[0].y + direction.y * gridSize };
    snake.unshift(head);

    // Check if the snake eats the food
    if (head.x === food.x && head.y === food.y) {
        score++;
        if (score % 5 === 0 && level < 20) {
            level++;
            speed -= 5; // Increase speed
        }
        food = { x: gridSize * Math.floor(Math.random() * (canvas.width / gridSize)), y: gridSize * Math.floor(Math.random() * (canvas.height / gridSize)) };
    } else {
        snake.pop(); // Remove the tail
    }

    // Check for collisions
    if (
        head.x < 0 || head.y < 0 || head.x >= canvas.width || head.y >= canvas.height ||
        snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)
    ) {
        lives--;
        updateLivesDisplay();
        if (lives === 0) {
            showGameOverModal();
        } else {
            resetSnakePosition();
        }
    }
}

// Draw game objects
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the snake
    ctx.fillStyle = "#39ff14";
    snake.forEach(segment => {
        ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
    });

    // Draw the food
    ctx.fillStyle = "#ff4500";
    ctx.fillRect(food.x, food.y, gridSize, gridSize);

    // Update stats
    scoreDisplay.textContent = `Score: ${score}`;
    levelDisplay.textContent = `Level: ${level}`;
    highScoreDisplay.textContent = `High Score: ${highScore}`;
}

// Reset snake position after losing a life
function resetSnakePosition() {
    snake = [{ x: 300, y: 300 }];
    direction = { x: 0, y: 0 };
}

// Show game over modal
function showGameOverModal() {
    modalTitle.textContent = "Game Over!";
    livesLeft.textContent = "Lives: 💔💔💔";
    modal.style.display = "flex";
}

// Restart game
restartButton.addEventListener("click", () => {
    if (score > highScore) {
        highScore = score;
    }
    score = 0;
    level = 1;
    speed = 150;
    lives = 3;
    snake = [{ x: 300, y: 300 }];
    direction = { x: 0, y: 0 };
    food = { x: gridSize * Math.floor(Math.random() * (canvas.width / gridSize)), y: gridSize * Math.floor(Math.random() * (canvas.height / gridSize)) };
    updateLivesDisplay();
    modal.style.display = "none";
    gameLoop();
});

// Update lives display
function updateLivesDisplay() {
    livesDisplay.textContent = `Lives: ${"❤️".repeat(lives)}${"💔".repeat(3 - lives)}`;
}

// Handle keyboard input
document.addEventListener("keydown", event => {
    switch (event.key) {
        case "ArrowUp":
            if (direction.y === 0) direction = { x: 0, y: -1 };
            break;
        case "ArrowDown":
            if (direction.y === 0) direction = { x: 0, y: 1 };
            break;
        case "ArrowLeft":
            if (direction.x === 0) direction = { x: -1, y: 0 };
            break;
        case "ArrowRight":
            if (direction.x === 0) direction = { x: 1, y: 0 };
            break;
    }
});

// Start the game
updateLivesDisplay();
gameLoop();

