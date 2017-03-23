const makeBoard = (gameBoard) => {
  // console.log('gameBoard is: ', gameBoard);
  let board = '';
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 7; j++) {
      if (gameBoard[i][j] === 0) {
        board += ':white_large_square: ';
      } else if (gameBoard[i][j] === 'black') {
        board += ':black_circle: ';
      } else if (gameBoard[i][j] === 'red') {
        board += ':red_circle: ';
      }
    }
    board += '\n';
  }
  return board;
};
/*
if (sameColorInARow === 4) {
        return true;
      }*/

const checkForTie = (columnTotal) => {
  for (let i = 0; i < columnTotal.length; i++) {
    if (columnTotal[i] !== 6) {
      return false;
    }
  }
  return true;
};

const checkForHorizontalWin = (board) => {
  let consecutiveColorInARow = 1;
  for (let i = 0; i < board.length; i++) {
    for (let j = 1; j < board[i].length; j++) { // try switching to 1
      // console.log('board[i][j] is: ', board[i][j], 'board[i][j-1] is: ', board[i][j-1]);
      if (board[i][j] !== 0 && (board[i][j] === board[i][j - 1])) {
        consecutiveColorInARow++;
        // console.log('consecutiveColorInARow is: ', consecutiveColorInARow);
        if (consecutiveColorInARow === 4) {
          return true;
        }
      } else {
        consecutiveColorInARow = 1;
      }
    }
    consecutiveColorInARow = 1;
  }
  return false;
};

const checkForVerticalWin = (board) => {
  let consecutiveColorInAColumn = 1;
  for (let i = 0; i < 7; i++) {
    for (let j = 1; j < board.length; j++) {
      if (board[j][i] !== 0 && board[j][i] === board[j - 1][i]) {
        consecutiveColorInAColumn++;
        if (consecutiveColorInAColumn === 4) {
          return true;
        }
      } else {
        consecutiveColorInAColumn = 1;
      }
    }
    consecutiveColorInAColumn = 1;
  }
  return false;
};

// NOTE to see if a player has won via a diagonal connect 4: could iterate from -2 up to 3 by 1. for each array check if the array at the current index is the same as it was at the previous array w/ the index - 1

const checkForDiagonalWin = (board) => {
  let consecutiveColorDiagonally = 1;
  for (let i = -2; i < 4; i++) {
    var subNum = 0;
    if (i < 0) {
      subNum = Math.abs(i);
    }
    for (let j = 0; j < board.length - subNum - 1; j++) {
      // console.log('j is: ', j, 'subNum is: ', subNum);
      // console.log('board[j][j-subNum] is: ', board[j][j-subNum], 'board[j-1][j-subNum-1] is: ', board[j-1][j-subNum-1]);
      // console.log(board[5][0]);
      if (board[5 - subNum - j][j] !== 0 && board[5 - subNum - j][j] === board[5 - subNum - j - 1][j + 1]) {
        if (++consecutiveColorDiagonally === 4) {
          return true;
        }
      } else {
        consecutiveColorDiagonally = 1;
      }
    }
    consecutiveColorDiagonally = 1;
  }
  return false;
};

// check if a user has won
  // create checkForWin function which takes the array of the game board
const checkForWin = (board) => {
  // NOTE: to see if a player has won via a horizontal connect 4: could iterate over each row and see if there are four in a row w/red or black
  const horizontalWin = checkForHorizontalWin(board);
  if (horizontalWin) {
    return true;
  }
  const verticalWin = checkForVerticalWin(board);
  if (verticalWin) {
    return true;
  }
  const diagonalWin = checkForDiagonalWin(board);
  if (diagonalWin) {
    return true;
  }
  /*
  board.forEach( (row) => {
    row.forEach( (column, index) => {
      // console.log('column is: ', column, 'index is: ', index, 'row[index- 1] is: ', row[index-1]);
      if (column !== 0 && column === row[index-1]) {
        sameColorInARow++;
      }
      if (sam)
    });
  });*/
  /* for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < )
  }*/
  return false;
};
  // NOTE: to see if a player has won via a vertical connect 4: could iterate over each array of arrays from 0-6 and check if there are 4 in a row of 'red' or 'black' at the index being iterated over

module.exports = {
  makeBoard,
  checkForWin,
  checkForTie,
};
