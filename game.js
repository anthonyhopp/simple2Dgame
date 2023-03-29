const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const starSize = 20;
const gravity = 0.5;
const jumpStrength = 12;
let scrollSpeed = 2;
let obstacleSpawnRate = 100;
let frameCount = 0;
let obstacles = [];

let star = {
  x: canvas.width / 4,
  y: canvas.height / 2,
  width: starSize,
  height: starSize,
  velocityY: 0,
  grounded: false,
};

function createObstacle() {
  const height = 30 + Math.random() * 60;
  const obstacle = {
    x: canvas.width,
    y: canvas.height - 50 - height,
    width: 20,
    height: height,
  };
  obstacles.push(obstacle);
}

function drawObstacles() {
  ctx.fillStyle = "red";
  for (const obstacle of obstacles) {
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  }
}

function updateObstacles() {
  for (const obstacle of obstacles) {
    obstacle.x -= scrollSpeed;
  }
  obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
}

let gameOver = false;
let elapsedTime = 0;
let timer;

function startTimer() {
  timer = setInterval(() => {
    elapsedTime++;
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
}

function drawTimer() {
  ctx.fillStyle = "black";
  ctx.font = "24px Arial";
  ctx.fillText(`Time: ${elapsedTime}s`, 10, 30);
}

function checkCollision(obstacle) {
  return (
    star.x + star.width / 2 >= obstacle.x &&
    star.x - star.width / 2 <= obstacle.x + obstacle.width &&
    star.y + star.height / 2 >= obstacle.y
  );
}

function gameOverScreen() {
  ctx.fillStyle = "black";
  ctx.font = "48px Arial";
  ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);
  ctx.font = "24px Arial";
  ctx.fillText(
    `Press Enter to restart`,
    canvas.width / 2 - 90,
    canvas.height / 2 + 40
  );
}

function restartGame() {
  elapsedTime = 0;
  obstacles = [];
  star.y = canvas.height / 2;
  star.velocityY = 0;
  gameOver = false;
  startTimer();
}

function keyDownHandler(e) {
  if (e.key === "Enter" && gameOver) {
    e.preventDefault();
    restartGame();
  } else if (e.key === "ArrowUp" && star.grounded) {
    e.preventDefault();
    star.velocityY = -jumpStrength;
  } else if (e.key === "ArrowRight") {
    e.preventDefault();
    scrollSpeed = 4;
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    scrollSpeed = 0;
  }
}

function keyUpHandler(e) {
  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
    scrollSpeed = 2;
  }
}

function update() {
  if (gameOver) {
    stopTimer();
    gameOverScreen();
    requestAnimationFrame(update);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Scroll background
  ctx.translate(-scrollSpeed, 0);

  // Draw ground
  ctx.fillStyle = "green";
  ctx.fillRect(  0, canvas.height - 50, canvas.width + scrollSpeed, 50);

  // Draw star
  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.arc(star.x, star.y, star.width / 2, 0, Math.PI * 2);
  ctx.fill();

  // Draw obstacles
  drawObstacles();

  // Update star position
  star.velocityY += gravity;
  star.y += star.velocityY;

  // Check for collisions with ground
  if (star.y + star.height / 2 >= canvas.height - 50) {
    star.y = canvas.height - 50 - star.height / 2;
    star.velocityY = 0;
    star.grounded = true;
  } else {
    star.grounded = false;
  }

  // Update and spawn obstacles
  updateObstacles();
  frameCount++;
  if (frameCount % obstacleSpawnRate === 0) {
    createObstacle();
  }

  // Check for collisions with obstacles
  for (const obstacle of obstacles) {
    if (checkCollision(obstacle)) {
      gameOver = true;
      break;
    }
  }

  // Reset translation
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // Draw timer
  drawTimer();

  requestAnimationFrame(update);
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

// Start the timer
startTimer();

update();
