// Simple hotseat version
const words = [
  'apple', 'dog', 'house', 'car', 'flower', 'tree',
  'computer', 'phone', 'book', 'shoe', 'banana', 'bridge', 'cat', 'cloud',
  'dragon', 'guitar', 'mountain', 'pizza', 'rocket', 'train'
];

// Game State
let currentWord = '';
let playing = false;
let timer = 60;
let timerInterval = null;

// DOM Elements
const startBtn = document.getElementById('startBtn');
const guessBtn = document.getElementById('guessBtn');
const guessInput = document.getElementById('guessInput');
const board = document.getElementById('board');
const ctx = board.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const clearBtn = document.getElementById('clearBtn');
const hint = document.getElementById('hint');
const timerEl = document.getElementById('timer');
const results = document.getElementById('results');

// Drawing state
let drawing = false;
let last = {x:0,y:0};

function pickWord() {
  return words[Math.floor(Math.random() * words.length)];
}

// --- Drawing Events ---
board.addEventListener('mousedown', (e) => {
  if (!playing) return;
  drawing = true;
  last = getPos(e);
});
board.addEventListener('touchstart', (e) => {
  if (!playing) return;
  drawing = true;
  last = getTouchPos(e);
});

document.addEventListener('mouseup', () => drawing = false);
document.addEventListener('touchend', () => drawing = false);
board.addEventListener('mouseleave', () => drawing = false);

board.addEventListener('mousemove', draw);
board.addEventListener('touchmove', drawTouch);

function getPos(e) {
  const rect = board.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (board.width / rect.width),
    y: (e.clientY - rect.top) * (board.height / rect.height)
  };
}
function getTouchPos(e) {
  const rect = board.getBoundingClientRect();
  const touch = e.touches[0];
  return {
    x: (touch.clientX - rect.left) * (board.width / rect.width),
    y: (touch.clientY - rect.top) * (board.height / rect.height)
  };
}
function draw(e) {
  if (!drawing) return;
  const pos = getPos(e);
  ctx.strokeStyle = colorPicker.value;
  ctx.lineWidth = brushSize.value;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = colorPicker.value;
  ctx.shadowBlur = brushSize.value * 0.8;
  ctx.beginPath();
  ctx.moveTo(last.x, last.y);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
  last = pos;
}
function drawTouch(e) {
  if (!drawing) return;
  e.preventDefault();
  const pos = getTouchPos(e);
  ctx.strokeStyle = colorPicker.value;
  ctx.lineWidth = brushSize.value;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = colorPicker.value;
  ctx.shadowBlur = brushSize.value * 0.8;
  ctx.beginPath();
  ctx.moveTo(last.x, last.y);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
  last = pos;
}

// --- Controls ---
clearBtn.onclick = () => {
  ctx.clearRect(0, 0, board.width, board.height);
  ctx.beginPath();
};

colorPicker.onchange = () => {
  ctx.strokeStyle = colorPicker.value;
  ctx.shadowColor = colorPicker.value;
};
brushSize.oninput = () => {
  ctx.lineWidth = brushSize.value;
  ctx.shadowBlur = brushSize.value * 0.8;
};

// --- Game Logic ---
function showHint(word) {
  let output = '';
  for (let c of word) {
    if (Math.random() < 0.4) output += c;
    else output += '_ ';
  }
  hint.innerHTML = 'Hint: ' + output;
}

function startGame() {
  ctx.clearRect(0,0, board.width, board.height);
  results.innerText = '';
  currentWord = pickWord();
  showHint(currentWord);
  playing = true;
  timer = 60;
  timerEl.innerText = '⏰ 60';
  guessInput.disabled = false;
  guessBtn.disabled = false;
  guessInput.value = '';
  startBtn.disabled = true;
  startBtn.innerText = 'Game in Progress';
  timerEl.style.color = '#e31758';
  timerInterval = setInterval(() => {
    timer--;
    timerEl.innerText = '⏰ ' + timer;
    if (timer === 0) {
      loseGame();
    }
    if (timer <= 10) {
      timerEl.style.color = '#e17';
    }
  }, 1000);
}

function loseGame() {
  clearInterval(timerInterval);
  playing = false;
  hint.innerText = `Time's up! The word was "${currentWord}".`;
  results.innerText = 'Try again!';
  guessInput.disabled = true;
  guessBtn.disabled = true;
  startBtn.disabled = false;
  startBtn.innerText = 'Start New Game';
}
function winGame() {
  clearInterval(timerInterval);
  playing = false;
  results.innerText = `🎉 Correct! The word was "${currentWord}".`;
  hint.innerText = 'Well done!';
  guessInput.disabled = true;
  guessBtn.disabled = true;
  startBtn.disabled = false;
  startBtn.innerText = 'Start New Game';
  timerEl.style.color = '#21f170';
}

startBtn.onclick = startGame;
guessBtn.onclick = () => {
  if (!playing) return;
  if (guessInput.value.trim().toLowerCase() === currentWord.toLowerCase()) {
    winGame();
  } else {
    results.innerText = 'Incorrect, try again!';
    results.style.color = '#e31758';
    setTimeout(() => {
      results.innerText = '';
      results.style.color = '#21243d';
    }, 1100);
  }
};
guessInput.addEventListener('keydown', (e) => {
  if (!playing) return;
  if (e.key === 'Enter') guessBtn.onclick();
});

// Setup board for responsiveness
function resizeCanvas() {
  let w = Math.min(600, document.body.offsetWidth - 40);
  board.width = w;
  board.height = Math.round(w * 2/3);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
