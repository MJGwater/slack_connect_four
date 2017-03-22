const newBoardState = [[0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]];
const numberInColumn = [0, 0, 0, 0, 0, 0, 0];

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

//check if a user has won
  //create checkForWin function which takes the array of the game board
  checkForWin = (board) => {
    //NOTE: to see if a player has won via a horizontal connect 4: could iterate over each row and see if there are four in a row w/red or black 
    const horizontalWin = checkForHorizontalWin(board);
    if (horizontalWin) {
      return true;
    }
    const verticalWin = checkForVerticalWin(board);
    if (verticalWin) {
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
    /*for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < )   
    }*/
  };
  // NOTE: to see if a player has won via a vertical connect 4: could iterate over each array of arrays from 0-6 and check if there are 4 in a row of 'red' or 'black' at the index being iterated over
  // NOTE to see if a player has won via a diagonal connect 4: could iterate from -2 up to 3 by 1. for each array check if the array at the current index is the same as it was at the previous array w/ the index - 1
const checkForHorizontalWin = (board) => {
  let consecutiveColorInARow = 1;
  for (let i = 0; i < board.length; i++) {
    for (let j = 1; j < board[i].length; j++) { // try switching to 1
      console.log('board[i][j] is: ', board[i][j], 'board[i][j-1] is: ', board[i][j-1]);
      if (board[i][j] !== 0 && (board[i][j] === board[i][j-1])) {
        consecutiveColorInARow++;
        console.log('consecutiveColorInARow is: ', consecutiveColorInARow);
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
      if (board[j][i] !== 0 && board[j][i] === board[j-1][i]) {
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


module.exports = {
  makeBoard,
  newBoardState,
  numberInColumn,
  checkForWin,
};
