require('./setup.js');
const BotKit = require('botkit');
const board = require('./board.js');

const controller = BotKit.slackbot({
  debug: false,
});

controller.spawn({
  token: process.env.SLACK_BOT_TOKEN,
}).startRTM();

const { hears, storage: { teams } } = controller;

const checkIfPlayingGame = (player1, player2, teamData) => {
  if (teamData && teamData.games[player1] && (teamData.games[player1].player1 === player1 || teamData.games[player1].player2 === player1)) {
    return 'player 1';
  }
  if (teamData && teamData.games[player2] && (teamData.games[player2].player1 === player2 || teamData.games[player2].player2 === player2)) {
    return 'player 2';
  }
  return false;
};

const createGame = (teamData, message, player1, player2) => {
  const newBoard = [[0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]];
  const newBoardStr = board.makeBoard(newBoard);
  const numberInColumn = [0, 0, 0, 0, 0, 0, 0];
  teamData = teamData || { id: message.team, games: {}, };
  const gameData = { player1, player2, boardArr: newBoard, boardStr: newBoardStr, numberInColumn, over: false, };
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
        startPrivateConvo(player1, bot, message.team);
      }
    });
  });
};

const gameOverMessages = (gameStatus, convo, theGame, player, bot, teamData) => {
  theGame.over = true;
  convo.say(`${theGame.boardStr}`);
  gameStatus === 'win' ? convo.say(`Game over! <@${player}> wins!`) : convo.say(`Game over! <@${theGame.player1}> and <@${theGame.player2}> have tied!`);
  const playerNotCurrentlyTakingTurn = player === theGame.player1 ? theGame.player2 : theGame.player1;
  bot.startPrivateConversation({ user: playerNotCurrentlyTakingTurn }, (err, convo) => {
    convo.say(`${theGame.boardStr}`);
    gameStatus === 'win' ? convo.say(`Game over! <@${player}> wins!`) : convo.say(`Game over! <@${theGame.player1}> and <@${theGame.player2}> have tied!`);
  });
  //setTimeout ensures player sees game outcome before that info is posted to the general channel.
  gameStatus === 'win' ? setTimeout(postToGeneralChannelId.bind(null, bot, [`Game over! <@${player}> has defeated <@${playerNotCurrentlyTakingTurn}> in Connect 4.`, 'If you want to get in on the Connect 4 action direct message me!']), 2500) : setTimeout(postToGeneralChannelId.bind(null, bot, [`<@${player}> has tied <@${playerNotCurrentlyTakingTurn}> in Connect 4.`, 'If you want to get in on the Connect 4 action direct message me!']), 2500);
};

const invalidMove = (response, convo) => {
  convo.say('Invalid move! Please type a number from 1-7 to select a column.');
  convo.repeat();
  convo.next();
};

const playerChoosesNumberBetween1and7 = (bot, teamData, theGame, color, player) => {
  return (response, convo) => {
    const indexChosen = Number(response.text) - 1;
    if (theGame.numberInColumn[indexChosen] === 6) {
      convo.say('This column is full. Please choose another column.');
      convo.repeat();
      convo.next();
    } else {
      theGame.boardArr[5 - theGame.numberInColumn[indexChosen]][indexChosen] = color;
      theGame.numberInColumn[indexChosen]++;
      theGame.boardStr = board.makeBoard(theGame.boardArr);
      const aWinner = board.checkForWin(theGame.boardArr);
      const aTie = board.checkForTie(theGame.numberInColumn);
      const gameOverStatus = aWinner ? 'win' : aTie ? 'tie' : false;
      if (gameOverStatus) {
        gameOverMessages(gameOverStatus, convo, theGame, player, bot, teamData);
      } else {
        convo.say(`You responded ${response.text}. The new board is \n${theGame.boardStr}`);
        convo.say('We\'ll let you know when its your turn again.');
      }
      convo.next();
    }
  };
};

const postToGeneralChannelId = (bot, messages) => {
  bot.api.channels.list({}, (err, response) => {
    let generalChannelId = '';
    for (let i = 0; i < response.channels.length; i++) {
      if (response.channels[i].name === 'general') {
        generalChannelId = response.channels[i].id;
      }
    }
    for (let i = 0; i < messages.length; i++) {
      bot.say({
        text: messages[i],
        channel: generalChannelId,
      });
    }
  });
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

hears('^play <@([a-z0-9-._]+)>', 'direct_message', (bot, message) => {
  const player1 = message.user;
  const player2 = message.match[1];
  if (player1 === player2) {
    bot.reply(message, 'You can\'t play Connect 4 with yourself!');
  } else {
    teams.get(message.team, (err, teamData) => {
      const playingGame = checkIfPlayingGame(player1, player2, teamData);
      if (playingGame === 'player 1') {
        bot.reply(message, 'You can\'t start a new game because you\'re already in a game!');
      } else if (playingGame === 'player 2') {
        bot.reply(message, `Sorry, <@${player2}> is already playing a game!`);
      } else {
        bot.api.users.info({ user: player2 }, (err, player2Info) => {
          if (player2Info.user.is_bot || player2Info.user.id === 'USLACKBOT') {
            bot.reply(message, 'Bots can\'t play!');
          } else {
            teamData = createGame(teamData, message, player1, player2);
            teams.save(teamData, (err1) => {
              if (err1) throw err1;
              tellPlayer2GameHasStarted(bot, message, player1, player2);
            });
          }
        });
      }
    });
  }
});

hears('^(?!^play (<@[a-z0-9-._]+>))', 'direct_message', (bot, message) => {
  teams.get(message.team, (err2, teamData) => {
    const playingGame = checkIfPlayingGame(message.user, undefined, teamData);
    if (playingGame === 'player 1' && (Number(message.text) >= 1 && Number(message.text) <= 7)) {
      bot.reply(message, 'Its not your turn yet!');
    } else if (playingGame === 'player 1') {
      bot.reply(message, 'I don\'t understand what you said. Its not your turn yet anyway!');
    } else if (Number(message.text) >= 1 && Number(message.text) <= 7) {
      bot.reply(message, 'You\'re not playing a connect 4 game right now!');
    } else {
      bot.startConversation(message, (err, convo) => {
        convo.say('I don\'t understand what you said. I exist to facilitate Connect 4 games.');
        convo.say('To start a game type the word play and directly mention the name of the user you want to play. For example...');
        convo.say('play <@connect4>');
        convo.say('But don\'t try to play me! You can currently only play human users.');
      });
    }
  });
});
