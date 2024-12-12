// Select the canvas and set up the context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Canvas dimensions (increased size for wider play space)
canvas.width = 800;
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
const lifeModal = document.getElementById("lifeModal");
const gameOverModal = document.getElementById("gameOverModal");
const remainingLives = document.getElementById("remainingLives");
const resumeButton = document.getElementById("resumeButton");
const restartButton = document.getElementById("restartButton");

// State to track modal visibility
let isModalOpen = false;

// Game loop
function gameLoop() {
    if (!isModalOpen) {
        setTimeout(() => {
            update();
            draw();
            if (lives > 0) gameLoop();
        }, speed);
    }
}

// Update game state
function update() {
    moveSnake();

    // Check if the snake eats the food
    const head = snake[0];
    if (head.x === food.x && head.y === food.y) {
        score += 100;
        if (score >= 1000 * level) {
            level++;
            speed -= 5; // Increase speed
            announceLevel(level); // Show level announcement
        }
        food = { x: gridSize * Math.floor(Math.random() * (canvas.width / gridSize)), y: gridSize * Math.floor(Math.random() * (canvas.height / gridSize)) };
    } else {
        snake.pop(); // Remove the tail
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
}

// Move the snake
function moveSnake() {
    const head = { x: snake[0].x + direction.x * gridSize, y: snake[0].y + direction.y * gridSize };

    // Wrap around if the snake goes out of bounds
    if (head.x < 0) {
        head.x = canvas.width - gridSize;
    } else if (head.x >= canvas.width) {
        head.x = 0;
    }
    if (head.y < 0) {
        head.y = canvas.height - gridSize;
    } else if (head.y >= canvas.height) {
        head.y = 0;
    }

    snake.unshift(head);
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

// Announce new level
function announceLevel(level) {
    const levelAnnouncement = document.createElement("div");
    levelAnnouncement.textContent = `Level ${level}`;
    levelAnnouncement.style = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 4em;
        color: #ff4500;
        text-shadow: 0 0 20px #ff4500;
        animation: flash 1.5s ease-in-out 3;
    `;
    document.body.appendChild(levelAnnouncement);
    setTimeout(() => levelAnnouncement.remove(), 3000);
}

// Update lives display
function updateLivesDisplay() {
    livesDisplay.textContent = `Lives: ${"❤️".repeat(lives)}${"💔".repeat(3 - lives)}`;
}

// Show life lost modal
function showLifeModal() {
    isModalOpen = true;
    remainingLives.textContent = `Lives: ${"❤️".repeat(lives)}${"💔".repeat(3 - lives)}`;
    lifeModal.style.display = "flex";
}

// Resume the game
resumeButton.addEventListener("click", () => {
    lifeModal.style.display = "none";
    isModalOpen = false;
    gameLoop();
});

// Show game over modal
function showGameOverModal() {
    isModalOpen = true;
    if (score > highScore) highScore = score;
    highScoreDisplay.textContent = `High Score: ${highScore}`;
    gameOverModal.style.display = "flex";
}

// Restart the game
restartButton.addEventListener("click", () => {
    score = 0;
    level = 1;
    lives = 3;
    speed = 150;
    snake = [{ x: 300, y: 300 }];
    direction = { x: 0, y: 0 };
    updateLivesDisplay();
    gameOverModal.style.display = "none";
    isModalOpen = false;
    gameLoop();
});

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










