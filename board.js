const makeBoard = (gameBoard) => {
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
    for (let j = 1; j < board[i].length; j++) { 
      if (board[i][j] !== 0 && (board[i][j] === board[i][j - 1])) {
        consecutiveColorInARow++;
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

const checkForDiagonalWin = (board) => {
  let consecutiveColorDiagonally = 1;
  for (let i = -2; i < 4; i++) {
    var subNum = 0;
    if (i < 0) {
      subNum = Math.abs(i);
    }
    for (let j = 0; j < board.length - subNum - 1; j++) {
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

const checkForWin = (board) => {
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
  return false;
};

module.exports = {
  makeBoard,
  checkForWin,
  checkForTie,
};
