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

const checkIfPlayingGame = (player1, player2, teamData, lengthToSearchOver) => {
  for (let i = 0; i < lengthToSearchOver; i++) {
    if (teamData.games[i].player1 === player1 || teamData.games[i].player2 === player1) {
      return 'player 1';
    }
    if (teamData.games[i].player1 === player2 || teamData.games[i].player2 === player2) {
      return 'player 2';
    }
  }
};


const privateConvoWithPlayer1 = (bot, message) => {
  return (err, convo) => {
    teams.get(message.team, (err2, teamData) => {
      // console.log('teamData is: ', teamData);
      // const theRightGame
      for (let i = 0; i < teamData.games.length; i++) {
        if (teamData.games[i].player1 === message.user) {
          // console.log('i think i\'m never hitting here');
          const theRightGame = teamData.games[i];
          convo.ask(`${theRightGame.boardStr} It's your turn. Choose a # between 1-7 to select a column.`);
        }
      }
    });
  }
}

hears('^play <@([a-z0-9-._]+)>', 'direct_message', (bot, message) => {
  // console.log('message is: ', message);
  const player1 = message.user;
  const player2 = message.match[1];
  // console.log('player1 is: ', player1, 'player2 is: ', player2);
  if (player1 === player2) {
    bot.reply(message, 'You can\'t play Connect4 with yourself!');
  } else {
    teams.get(message.team, (err, teamData) => {
      console.log('teamData is: ', teamData);
      const lengthToSearchOver = teamData ? teamData.games.length : 0;
      const playingGame = checkIfPlayingGame(player1, player2, teamData, lengthToSearchOver);
        if (playingGame === 'player 1') {
          bot.reply(message, 'You can\'t start a new game because you\'re already in a game!');
        } else if (playingGame === 'player 2') {
          bot.reply(message, `Sorry, <@${player2}> is already playing a game!`);
        } else {
            bot.api.users.info({ user: player2 }, (err, player2Info) => {
              if (player2Info.user.is_bot || player2Info.user.id === 'USLACKBOT') {
                bot.reply(message, 'Bots can\'t play!');
              } else {
                // bot.reply(message, 'Both players are human!');
                const newBoard = board.newBoardState;
                console.log('message.team is: ', message.team);
                teamData = teamData || {
                  id: message.team,
                  games: [],
                }
                const gameData = {
                  id: message.team,
                  player1,
                  player2,
                  boardArr: newBoard,
                  boardStr: board.makeBoard(newBoard),
                  numberInColumn: board.numberInColumn,
                };
                teamData.games.push(gameData);
                // console.log('gameData is: ', gameData);
                teams.save(teamData, (err1) => {
                  if (err1) throw err1;
                  console.log('teams is: ', teams);
                  // teams.get(message.team, (err2, teamData) => {
                    // console.log('teamData is: ', teamData);
                  bot.startPrivateConversation({user: player2}, (err, convo) => {
                    convo.say(`<@${player1}> has started a game of connect4 with you! We'll let you know when its your turn.`)
                    convo.next();
                  });
                  bot.startConversation(message, privateConvoWithPlayer1(bot, message));
                });
              }
            });
        }
    });
  }
});

hears('^(?!^play (<@[a-z0-9-._]+>))', 'direct_message', (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    convo.say('I don\'t understand what you said. I exist to facilitate Connect4 games.');
    convo.say('To start a game type the word play and directly mention the name of the user you want to play. For example...');
    convo.say('play <@connect4>');
  });
});
