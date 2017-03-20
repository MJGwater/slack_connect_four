const newBoardState = [[0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]];
const numberInColumn = [0, 0, 0, 0, 0, 0, 0];

const makeBoard = (gameBoard) => {
  // console.log('gameBoard is: ', gameBoard);
  let board = '';
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 7; j++) {
      if (gameBoard[i][j] === 0) {
        board += ':white_large_square: ';
      } else if (gameBoard[i][j] === 1) {
        board += ':black_circle: ';
      } else if (gameBoard[i][j] === 2) {
        board += ':red_circle: ';
      }
    }
    board += '\n';
  }
  return board;
};

module.exports = {
  makeBoard,
  newBoardState,
  numberInColumn,
};
