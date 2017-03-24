const controller = require('./bot-setup.js').controller;

const { storage: { teams } } = controller;

const gameMessages = require('./end-game.js');
const gameCalculations = require('./game-calculations.js');

const invalidMove = (response, convo) => {
  convo.say('Invalid move! Please type a number from 1-7 to select a column.');
  convo.repeat();
  convo.next();
};

const playerChoosesNumberBetween1and7 = (bot, teamData, theGame, color, player) => (response, convo) => {
  const indexChosen = Number(response.text) - 1;
  if (theGame.numberInColumn[indexChosen] === 6) {
    convo.say('This column is full. Please choose another column.');
    convo.repeat();
    convo.next();
  } else {
    theGame.boardArr[5 - theGame.numberInColumn[indexChosen]][indexChosen] = color;
    theGame.numberInColumn[indexChosen]++;
    theGame.boardStr = gameCalculations.makeBoard(theGame.boardArr);
    const aWinner = gameCalculations.checkForWin(theGame.boardArr);
    const aTie = gameCalculations.checkForTie(theGame.numberInColumn);
    const gameOverStatus = aWinner ? 'win' : aTie ? 'tie' : false;
    if (gameOverStatus) {
      gameMessages.gameOverMessages(gameOverStatus, convo, theGame, player, bot, teamData);
    } else {
      convo.say(`You responded ${response.text}. The new board is \n${theGame.boardStr}`);
      convo.say('We\'ll let you know when its your turn again.');
    }
    convo.next();
  }
};

const startPrivateConvo = (player, bot, teamID) => {
  bot.startPrivateConversation({ user: player }, (err, convo) => {
    teams.get(teamID, (err2, teamData) => {
      const theGame = teamData.games[player];
      const color = theGame.player1 === player ? 'black' : 'red';
      convo.ask(`${theGame.boardStr} It's your turn. Choose a # between 1-7 to select a column.`, [{
        pattern: '^[1-7]{1}$',
        callback: playerChoosesNumberBetween1and7(bot, teamData, theGame, color, player),
      }, {
        default: true,
        callback: invalidMove,
      },
      ], { key: 'move' });
      convo.on('end', (convo) => {
        if (convo.status === 'completed') {
          if (theGame.over) {
            delete teamData.games[theGame.player1];
            delete teamData.games[theGame.player2];
          } else if (player === theGame.player1) {
            startPrivateConvo(theGame.player2, bot, teamID);
          } else {
            startPrivateConvo(theGame.player1, bot, teamID);
          }
        }
      });
    });
  });
};

module.exports = {
  invalidMove,
  playerChoosesNumberBetween1and7,
  startPrivateConvo,
};
