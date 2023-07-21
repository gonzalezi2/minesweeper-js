'use strict';

// Game elements
const gameGrid = document.getElementById('game');
const timer = document.getElementById('timer');
const flags = document.getElementById('flags');
const resetBtn = document.getElementById('reset');

// Constants
const difficulty = 'easy';
const gameMatrixSize = {
  easy: {
    rows: 9,
    cols: 9,
  },
};
const minesAndFlags = 10;
const gameMatrix = Array(gameMatrixSize[difficulty].rows)
  .fill()
  .map(() => Array(gameMatrixSize[difficulty].cols).fill());

// Event listeners
resetBtn.addEventListener('click', resetGameHandler);
gameGrid.addEventListener('click', blockClickHandler);

let mineLocations = [];

while (mineLocations.length < minesAndFlags) {
  let randomGridLocation = getRandomGridLocations();
  if (mineLocations.indexOf(randomGridLocation) < 0) {
    mineLocations.push(randomGridLocation);
  }
}

function getRandomGridLocations() {
  const randomRow = Math.floor(Math.random() * 10);
  const randomCol = Math.floor(Math.random() * 10);
  return `${randomRow}${randomCol}`;
}

// Function for clicking on a block
function blockClickHandler(e) {
  if (e.target.classList.contains('block')) {
    e.target.classList.add('clicked');
  }
}

// Function to reset the game to a clean state
function resetGameHandler(e) {
  timer.innerText = '000';
  flags.innerText = `0${minesAndFlags}`;
}

// Recursive function to clear all the empty areas that are adjacent to the selected empty block
// function clearAdjacentEmptyAreaas()

// Endgame function when clicking on a mine that shows all the mines and highlights wrong flag placements
// function endGame()
