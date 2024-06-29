// Lucas Aurelio
// GUI HW5
// Lucas_aurelio@Student.uml.edu

// https://www.w3schools.com/jquery/default.asp
// https://www.w3schools.com/js/default.asp


// Define the tile data from the given structure
const tileData = {
  "pieces": [
    { "letter": "A", "value": 1, "amount": 9 },
    { "letter": "B", "value": 3, "amount": 2 },
    { "letter": "C", "value": 3, "amount": 2 },
    { "letter": "D", "value": 2, "amount": 4 },
    { "letter": "E", "value": 1, "amount": 12 },
    { "letter": "F", "value": 4, "amount": 2 },
    { "letter": "G", "value": 2, "amount": 3 },
    { "letter": "H", "value": 4, "amount": 2 },
    { "letter": "I", "value": 1, "amount": 9 },
    { "letter": "J", "value": 8, "amount": 1 },
    { "letter": "K", "value": 5, "amount": 1 },
    { "letter": "L", "value": 1, "amount": 4 },
    { "letter": "M", "value": 3, "amount": 2 },
    { "letter": "N", "value": 1, "amount": 6 },
    { "letter": "O", "value": 1, "amount": 8 },
    { "letter": "P", "value": 3, "amount": 2 },
    { "letter": "Q", "value": 10, "amount": 1 },
    { "letter": "R", "value": 1, "amount": 6 },
    { "letter": "S", "value": 1, "amount": 4 },
    { "letter": "T", "value": 1, "amount": 6 },
    { "letter": "U", "value": 1, "amount": 4 },
    { "letter": "V", "value": 4, "amount": 2 },
    { "letter": "W", "value": 4, "amount": 2 },
    { "letter": "X", "value": 8, "amount": 1 },
    { "letter": "Y", "value": 4, "amount": 2 },
    { "letter": "Z", "value": 10, "amount": 1 },
    { "letter": "Blank", "value": 0, "amount": 2 }
  ],
  "creator": "Ramon Meza"
};

// Generate a flat list of tiles based on the data
const allTiles = tileData.pieces.flatMap(tile => Array(tile.amount).fill(tile));

// Function to get the image path for a given tile letter
function getTileImage(letter) {
  return `Scrabble_Tile_${letter}.jpg`;
}

// Function to randomly select tiles from the full tile set
function randomTiles(quantity) {
  const selectedTiles = [];
  const usedIndices = new Set(); // Keep track of used indices to avoid duplicates

  while (selectedTiles.length < quantity) {
    const randomIndex = Math.floor(Math.random() * allTiles.length);

    // Make sure the tile at randomIndex is not already selected
    if (!usedIndices.has(randomIndex)) {
      selectedTiles.push(allTiles[randomIndex]);
      // Add
      usedIndices.add(randomIndex);
    }
  }
  return selectedTiles;
}

// Function to set up the Scrabble game board
function setUpBoard() {
  const gameBoard = $('#scrabbleBoard');
  gameBoard.empty(); // Make sure board is clear
  for (let i = 0; i < 15; i++) {
    const tile = $('<div>').addClass('board-square').css('left', `${i * 50}px`).data('index', i);
    gameBoard.append(tile); // Add sufficient squares to the board
  }
  $('.board-square').droppable({
    accept: ".tile", // Accept only elements with class 'tile'
    drop: tileDropping // Specify the drop handler
  });
}

// Function to handle dropping a tile onto the board
function tileDropping(event, ui) {
  const square = $(this);
  const index = square.data('index'); // Get the index of the square
  if (square.data('tile')) {
    ui.draggable.draggable('option', 'revert', true); // Prevent placing tile on a taken square
  }
  else if (isValidPlacement(index)) {
    const tile = ui.helper.data('tile'); // Get the tile data
    const tileImage = $('<img>').attr('src', getTileImage(tile.letter)).addClass('tile-img');
    square.append(tileImage).data('tile', tile); // Place the tile on the square
    ui.helper.remove(); // Remove the tile from the rack
    updateScore(); // Update the score
  }
  else {
    ui.draggable.draggable('option', 'revert', true); // Prevent placing in an invalid spot
  }
}

// Function to initialize the tile rack / player hand with a new set of tiles
function initializeTileRack() {
  const tileRack = $('#tileRack');
  tileRack.empty(); // Clear the rack
  const tiles = randomTiles(7); // Get 7 random tiles
  tiles.forEach(tile => {
    const tileElement = $('<div>').addClass('tile').data('tile', tile);
    const tileImage = $('<img>').attr('src', getTileImage(tile.letter)).addClass('tile-img');
    tileElement.append(tileImage);
    tileRack.append(tileElement); // Add tile to the rack
    tileElement.draggable({ revert: "invalid" }); // Make tiles draggable
  });
}

// Function to check if a tile placement is valid
function isValidPlacement(index) {
  const isFirstPlacement = $('.board-square').filter((_, elem) => $(elem).data('tile')).length === 0;
  if (isFirstPlacement) return true; // Allow first placement to be anywhere

  const adjacentIndices = [index - 1, index + 1];
  return adjacentIndices.some(i => i >= 0 && i < 15 && $('.board-square').eq(i).data('tile')); // Check if any adjacent square has a tile
}

// Function to calculate the socre and update
function updateScore() {
  let score = 0, multiplier = 1;
  $('.board-square').each((_, elem) => {
    const square = $(elem);
    const tile = square.data('tile');
    if (tile) {
      const index = square.data('index');
      if (bonusSquares[index]) {
        if (bonusSquares[index] === 'double-letter') {
          score += tile.value * 2; // Double letter score
        }
        else if (bonusSquares[index] === 'double-word') {
          score += tile.value;
          multiplier *= 2; // Double word score
        }
      }
      else {
        score += tile.value;
      }
    }
  });
  score *= multiplier; // Apply multiplier
  $('#score').text(`Score: ${score}`); // Update the score displayed
  return score; // Return the score
}

// Function to replenish the player hand to 7 tiles
function newHand() {
  const tileRack = $('#tileRack');
  const currentTiles = tileRack.children('.tile').length; // Get the number of current tiles in the rack
  const tilesNeeded = 7 - currentTiles; // Calculate the number of tiles needed to replenish
  const newTiles = randomTiles(tilesNeeded); // Get the new tiles

  newTiles.forEach(tile => {
    const tileElement = $('<div>').addClass('tile').data('tile', tile);
    const tileImage = $('<img>').attr('src', getTileImage(tile.letter)).addClass('tile-img');
    tileElement.append(tileImage);
    tileRack.append(tileElement); // Add tile to the rack
    tileElement.draggable({ revert: "invalid" }); // Make tiles draggable
  });
}

// Function to clear the board and prepare for a new round
function clearBoard() {
  $('.board-square').each((_, elem) => {
    const square = $(elem);
    square.empty().removeData('tile'); // Clear each square and remove tile data
  });
  newHand(); // Replenish player hand
}

// Function to update the total score
let totalScore = 0;
function updateTotalScore(newScore) {
  totalScore += newScore;
  $('#totalScore').text(`Total Score: ${totalScore}`); // Update the total score display
}

// DBonus squares
const bonusSquares = {
  2: 'double-word',
  6: 'double-letter',
  8: 'double-letter',
  12: 'double-word'
};

// Document ready function to set up the game
$(function() {
  setUpBoard(); // Initialize the game board
  initializeTileRack(); // Initialize the tile rack with a set of tiles
  $('#dealNewTiles').click(initializeTileRack); // When clicked give new tiles
  $('#restart').click(() => {
    setUpBoard(); // Reset the game
    initializeTileRack(); // Initialize the tile rack with new tiles
    $('#score').text('Score: 0'); // Reset the score
    totalScore = 0; // Reset the total score
    $('#totalScore').text('Total Score: 0'); // Update the total score
  });
  $('#playWord').click(() => {
    const currentScore = updateScore(); // Update and get the current score
    updateTotalScore(currentScore); // Update the total score
    clearBoard(); // Clear the board
  });
});
