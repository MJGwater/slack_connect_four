const inGame = require('./in-game.js');
const gameCalculations = require('./game-calculations.js');

const createGame = (teamData, message, player1, player2) => {
  const newBoard = [[0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]];
  const newBoardStr = gameCalculations.makeBoard(newBoard);
  const numberInColumn = [0, 0, 0, 0, 0, 0, 0];
  teamData = teamData || { id: message.team, games: {} };
  const gameData = { player1, player2, boardArr: newBoard, boardStr: newBoardStr, numberInColumn, over: false };
  teamData.games[player1] = gameData;
  teamData.games[player2] = gameData;
  return teamData;
};

const tellPlayer2GameHasStarted = (bot, message, player1, player2) => {
  bot.startPrivateConversation({ user: player2 }, (err, convo) => {
    convo.say(`<@${player1}> has started a game of connect 4 with you! We'll let you know when its your turn.`);
    convo.next();
    convo.on('end', (convo) => {
      if (convo.status === 'completed') {
        inGame.startPrivateConvo(player1, bot, message.team);
      }
    });
  });
};

module.exports = {
  createGame,
  tellPlayer2GameHasStarted,
};
