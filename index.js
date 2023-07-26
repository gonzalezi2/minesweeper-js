'use strict';

/**
 * Game elements
 */
const gameGrid = document.getElementById('game');
const timerElement = document.getElementById('timer');
const flags = document.getElementById('flags');
const resetBtn = document.getElementById('reset');
let isGameStart = false;
let interval;

/**
 * Game variables
 */
const difficulty = 'easy';
const gameMatrixSize = {
  easy: {
    rows: 9,
    cols: 9,
  },
};
let counter = 0;
let numOfGuessesLeft = 10;
const gameMatrix = Array(gameMatrixSize[difficulty].rows)
  .fill()
  .map(() => Array(gameMatrixSize[difficulty].cols).fill());

const numOfGameBlocks = gameMatrixSize[difficulty].rows * gameMatrixSize[difficulty].cols;

let mineLocations = [];

while (mineLocations.length < numOfGuessesLeft) {
  let randomGridLocation = getRandomGridLocations();
  if (mineLocations.indexOf(randomGridLocation) < 0) {
    mineLocations.push(randomGridLocation);
  }
}

function init() {
  resetBtn.innerHTML = '&#128578';
  timer.innerText = '000';
  flags.innerText = `${numOfGuessesLeft.toString().padStart(3, '0')}`;
  createGameBlocks();
  /**
   * Event listeners
   */
  resetBtn.addEventListener('click', resetGameHandler);
  gameGrid.addEventListener('click', blockClickHandler);
  gameGrid.addEventListener('contextmenu', rightClickHandler);
}

function getRandomGridLocations() {
  const randomRow = Math.floor(Math.random() * gameMatrixSize[difficulty].rows);
  const randomCol = Math.floor(Math.random() * gameMatrixSize[difficulty].cols);
  return `${randomRow},${randomCol}`;
}

function createGameBlocks() {
  gameGrid.innerHTML = '';
  for (let i = 0; i < gameMatrixSize[difficulty].rows; i += 1) {
    for (let j = 0; j < gameMatrixSize[difficulty].cols; j += 1) {
      const newBlock = document.createElement('div');
      newBlock.classList.add('block');
      newBlock.dataset.row = i;
      newBlock.dataset.col = j;
      gameGrid.append(newBlock);
    }
  }
}

function rightClickHandler(e) {
  e.preventDefault();

  if (!e.target.classList.contains('block')) {
    return;
  }

  if (e.target.classList.contains('flagged')) {
    numOfGuessesLeft += 1;
  } else {
    numOfGuessesLeft -= 1;
  }

  flags.innerText = `${numOfGuessesLeft.toString().padStart(3, '0')}`;
  e.target.classList.toggle('flagged');
}

// Function for clicking on a block
function blockClickHandler(e) {
  if (e.target.classList.contains('flagged') || !e.target.classList.contains('block')) {
    return;
  }

  e.target.classList.add('clicked');

  const targetRow = e.target.dataset.row;
  const targetCol = e.target.dataset.col;
  const blockCoords = `${targetRow},${targetCol}`;

  if (mineLocations.includes(blockCoords)) {
    e.target.classList.add('bomb');
    endGame();
  }

  // Start timer
  if (isGameStart === false) {
    isGameStart = true;
    interval = setInterval(() => {
      counter += 1;
      timer.innerText = `${counter.toString().padStart(3, '0')}`;
    }, 1000);
  }
}

// Function to reset the game to a clean state
function resetGameHandler() {
  clearInterval(interval);
  counter = 0;
  numOfGuessesLeft = 0;
  isGameStart = false;
  interval = undefined;

  init();
}

function endGame() {
  resetBtn.innerHTML = '&#128565';

  gameGrid.removeEventListener('click', blockClickHandler);
  gameGrid.removeEventListener('contextmenu', rightClickHandler);

  clearInterval(interval);
}

init();

// Recursive function to clear all the empty areas that are adjacent to the selected empty block
// function clearAdjacentEmptyAreaas()

// Endgame function when clicking on a mine that shows all the mines and highlights wrong flag placements
// function endGame()
