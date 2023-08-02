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
      rows: 16,
      cols: 30,
      mineCount: 99,
    },
  };
  let counter = 0;
  let mineCount;
  let mineLocations = [];

  // hash to store all neightboring blocks surrounding mines in order to get counts
  let numberedBlocksHash = {};

  // hash to store all neighboring blocks of empty spaces to recursively open all empty blocks
  // type block = [blockType: string, isOpen: boolean];
  let allBlocksHash = {};

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

    // Add mines randomly with their locations on the grid
    for (let i = 0; i < mineCount; i += 1) {
      let randomGridLocation = getRandomGridLocations();
      if (mineLocations.indexOf(randomGridLocation) < 0) {
        mineLocations.push(randomGridLocation);
      }
    }

    // For each mine in the list, get all surrounding blocks, keep track of them in order to count how many mines surround them, and then update the ui with the correct numbers when clicked
    mineLocations.forEach((mine) => {
      const numberBlocksStack = getAllNeighboringBlocks(mine);

      // const blockElement = document.querySelector(`div.block[data-coords="${mine}"]`);
      // blockElement.style.backgroundColor = 'red';

      numberBlocksStack.forEach((coord) => {
        if (mineLocations.includes(coord)) {
          return;
        }
        if (coord in numberedBlocksHash) {
          numberedBlocksHash[coord] += 1;
        } else {
          numberedBlocksHash[coord] = 1;
          allBlocksHash[coord] = ['numBlock', false];
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
        newBlock.dataset.coords = `${i},${j}`;
        gameGrid.append(newBlock);
      }
    }
  }

  function getAllNeighboringBlocks(mine) {
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

  function openCurrBlock(target, blockCoords) {
    target.classList.add('clicked');
    allBlocksHash[blockCoords][1] = true;
    target.innerText = numberedBlocksHash[blockCoords];
    delete numberedBlocksHash[blockCoords];
  }

  // Function for clicking on a block
  function blockClickHandler(e) {
    if (
      e.target.classList.contains('flagged') ||
      !e.target.classList.contains('block') ||
      e.target.classList.contains('clicked')
    ) {
      return;
    }

    const startTime = new Date();

    e.target.classList.add('clicked');

    const blockCoords = e.target.dataset.coords;

    // End the game if the current block contains a mine
    if (mineLocations.includes(blockCoords)) {
      e.target.classList.add('mine');
      endGame();
      return;
    }

    // show the correct number next to blocks neighboring mines
    // otherwise, iterate over each empty block and open all unused neightbor blocks
    if (blockCoords in numberedBlocksHash) {
      openCurrBlock(e.target, blockCoords);
    } else {
      openNeighboringBlocks(blockCoords, e);
    }

    // TODO: swtich to a more reliable timer
    // Start timer
    if (isGameStart === false) {
      isGameStart = true;
      interval = setInterval(() => {
        const currTime = Date.now();
        counter = (currTime - startTime) / 1000;
        if (Object.keys(numberedBlocksHash).length === 0) {
          clearInterval(interval);
          finalScoreElement.innerText = counter.toFixed(3);
          dialog.showModal();
        }
        timerElement.innerText = `${Number.parseInt(counter).toString().padStart(3, '0')}`;
      }, 100);
    }
  }

  function openNeighboringBlocks(currBlock) {
    // get all neighboring blocks for the current block
    const currNeighbors = getAllNeighboringBlocks(currBlock);
    const nextNeighbors = [];

    currNeighbors.forEach((block) => {
      const blockCoords = block.split(',');
      const blockElement = document.querySelector(`div.block[data-coords="${blockCoords[0]},${blockCoords[1]}"]`);

      if (blockElement.classList.contains('clicked')) {
        return;
      }
      // ignore any that are not empty
      if (block in allBlocksHash === false || allBlocksHash[block][1] === true) {
        allBlocksHash[block] = ['empty', true];
        // if they are empty, add 'clicked' class to them
        blockElement.classList.add('clicked', 'empty');
        nextNeighbors.push(block);
      } else {
        if (allBlocksHash[block][0] === 'numBlock' && allBlocksHash[block][1] === false) {
          openCurrBlock(blockElement, block);
        }
      }
    });

    if (nextNeighbors.length > 0) {
      nextNeighbors.forEach(openNeighboringBlocks);
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
    allBlocksHash = {};

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
