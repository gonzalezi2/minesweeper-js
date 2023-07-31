'use strict';

const MinesweeperJS = (function () {
  /**
   * Game elements
   */
  const gameGrid = document.getElementById('game');
  const timerElement = document.getElementById('timer');
  const mineCountElement = document.getElementById('flags');
  const resetBtn = document.getElementById('reset');
  const difficultySelectionBtns = document.getElementsByClassName('difficulty');
  const dialog = document.getElementById('game-over-dialog');
  const finalScoreElement = document.getElementById('final-score');

  // used for opening and styling the dialog without having to play
  // const openModalButton = document.getElementById('show-dialog');
  // openModalButton.addEventListener('click', () => dialog.showModal());

  /**
   * Game variables
   */
  let difficulty = 'beginner';
  let isGameStart = false;
  let interval;
  const gameSettings = {
    beginner: {
      rows: 9,
      cols: 9,
      mineCount: 10,
    },
    intermediate: {
      rows: 16,
      cols: 16,
      mineCount: 40,
    },
    advanced: {
      rows: 30,
      cols: 16,
      mineCount: 99,
    },
  };
  let counter = 0;
  let mineCount;
  let mineLocations = [];

  //variable to store all blocks surrounding mines in order to get counts
  let numberedBlocksHash = {};

  // const gameMatrix = Array(gameSettings[difficulty].rows)
  //   .fill()
  //   .map(() => Array(gameSettings[difficulty].cols).fill());

  // const numOfGameBlocks = gameSettings[difficulty].rows * gameSettings[difficulty].cols;

  function init() {
    resetBtn.innerHTML = '&#128578';
    timerElement.innerText = '000';
    mineCount = gameSettings[difficulty].mineCount;
    mineCountElement.innerText = `${mineCount.toString().padStart(3, '0')}`;
    createGameBlocks();

    for (let i = 0; i < mineCount; i += 1) {
      let randomGridLocation = getRandomGridLocations();
      if (mineLocations.indexOf(randomGridLocation) < 0) {
        mineLocations.push(randomGridLocation);
      }
    }

    // For each mine in the list, get all surrounding blocks, keep track of them in order to count how many mines surround them, and then update the ui with the correct numbers
    mineLocations.forEach((mine) => {
      const numberBlocksStack = getAllBlocksSurroundingMine(mine);

      numberBlocksStack.forEach((coord) => {
        if (coord in numberedBlocksHash) {
          numberedBlocksHash[coord] += 1;
        } else {
          numberedBlocksHash[coord] = 1;
        }
      });
    });

    gameGrid.className = difficulty;
    /**
     * Event listeners
     */
    resetBtn.addEventListener('click', resetGameHandler);
    gameGrid.addEventListener('click', blockClickHandler);
    gameGrid.addEventListener('contextmenu', rightClickHandler);
    for (const btn of difficultySelectionBtns) {
      btn.addEventListener('click', selectDifficulty);
    }
  }

  function getRandomGridLocations() {
    const randomRow = Math.floor(Math.random() * gameSettings[difficulty].rows);
    const randomCol = Math.floor(Math.random() * gameSettings[difficulty].cols);
    return `${randomRow},${randomCol}`;
  }

  function createGameBlocks() {
    gameGrid.innerHTML = '';
    for (let i = 0; i < gameSettings[difficulty].rows; i += 1) {
      for (let j = 0; j < gameSettings[difficulty].cols; j += 1) {
        const newBlock = document.createElement('div');
        newBlock.classList.add('block');
        newBlock.dataset.row = i;
        newBlock.dataset.col = j;
        gameGrid.append(newBlock);
      }
    }
  }

  function getAllBlocksSurroundingMine(mine) {
    // get the row and col of the current mine
    const [row, col] = mine.split(',').map((stringNum) => Number(stringNum));
    // get block coordinates of all surrounding blocks
    const surroundingBlocks = [];
    // iterate through the row before and after
    // the rows/cols are counted starting at 1 instead of 0 so we must subtract 1
    const startingRow = Math.max(0, row - 1);
    const endingRow = Math.min(row + 1, gameSettings[difficulty].rows - 1);
    const startingCol = Math.max(0, col - 1);
    const endingCol = Math.min(col + 1, gameSettings[difficulty].cols - 1);

    for (let i = startingRow; i <= endingRow; i++) {
      // iterate through the column before and after
      for (let j = startingCol; j <= endingCol; j++) {
        if (i === row && j === col) {
          continue;
        }
        surroundingBlocks.push(`${i},${j}`);
      }
    }
    return surroundingBlocks;
  }

  function selectDifficulty(e) {
    difficulty = e.target.dataset.difficulty;
    init();
  }

  function rightClickHandler(e) {
    e.preventDefault();

    if (!e.target.classList.contains('block')) {
      return;
    }

    if (e.target.classList.contains('flagged')) {
      mineCount += 1;
    } else {
      mineCount -= 1;
    }

    mineCountElement.innerText = `${mineCount.toString().padStart(3, '0')}`;
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
      return;
    }

    if (blockCoords in numberedBlocksHash) {
      e.target.innerText = numberedBlocksHash[blockCoords];
      delete numberedBlocksHash[blockCoords];
    }

    // TODO: swtich to requestAnimationFrame
    // Start timer
    if (isGameStart === false) {
      isGameStart = true;
      interval = setInterval(() => {
        if (Object.keys(numberedBlocksHash).length === 0) {
          clearInterval(interval);
          finalScoreElement.innerText = counter;
          dialog.showModal();
        }
        counter += 1;
        timerElement.innerText = `${counter.toString().padStart(3, '0')}`;
      }, 1000);
    }
  }

  // Function to reset the game to a clean state
  function resetGameHandler() {
    clearInterval(interval);
    counter = 0;
    mineCount = gameSettings[difficulty].mineCount;
    isGameStart = false;
    mineLocations = [];
    numberedBlocksHash = {};

    init();
  }

  // Endgame function when clicking on a mine that shows all the mines and highlights wrong flag placements
  function endGame() {
    resetBtn.innerHTML = '&#128565';

    gameGrid.removeEventListener('click', blockClickHandler);
    gameGrid.removeEventListener('contextmenu', rightClickHandler);

    clearInterval(interval);
  }

  init();

  // Function to clear all the empty areas that are adjacent to the selected empty block
  // function clearAdjacentEmptyAreaas()
})();
