const controller = require('./bot-setup.js').controller;
const startingHelpers = require('./starting-helpers.js');
const startingGame = require('./starting-game.js');

const { hears, storage: { teams } } = controller;




hears('^play <@([a-z0-9-._]+)>', 'direct_message', (bot, message) => {
  const player1 = message.user;
  const player2 = message.match[1];
  if (player1 === player2) {
    bot.reply(message, 'You can\'t play Connect 4 with yourself!');
  } else {
    teams.get(message.team, (err, teamData) => {
      const playingGame = startingHelpers.checkIfPlayingGame(player1, player2, teamData);
      if (playingGame === 'player 1') {
        bot.reply(message, 'You can\'t start a new game because you\'re already in a game!');
      } else if (playingGame === 'player 2') {
        bot.reply(message, `Sorry, <@${player2}> is already playing a game!`);
      } else {
        bot.api.users.info({ user: player2 }, (err, player2Info) => {
          if (player2Info.user.is_bot || player2Info.user.id === 'USLACKBOT') {
            bot.reply(message, 'Bots can\'t play!');
          } else {
            teamData = startingGame.createGame(teamData, message, player1, player2);
            teams.save(teamData, (err1) => {
              if (err1) throw err1;
              startingGame.tellPlayer2GameHasStarted(bot, message, player1, player2);
            });
          }
        });
      }
    });
  }
});

hears('^(?!^play (<@[a-z0-9-._]+>))', 'direct_message', (bot, message) => {
  teams.get(message.team, (err2, teamData) => {
    const playingGame = startingHelpers.checkIfPlayingGame(message.user, undefined, teamData);
    if (playingGame === 'player 1' && (Number(message.text) >= 1 && Number(message.text) <= 7)) {
      bot.reply(message, 'Its not your turn yet!');
    } else if (playingGame === 'player 1') {
      bot.reply(message, 'I don\'t understand what you said. Its not your turn yet anyway!');
    } else if (Number(message.text) >= 1 && Number(message.text) <= 7) {
      bot.reply(message, 'You\'re not playing a connect 4 game right now!');
    } else {
      bot.startConversation(message, (err, convo) => {
        convo.say('I don\'t understand what you said. I exist to facilitate Connect 4 games.');
        startingHelpers.startGameInstructions(convo);
      });
    }
  });
});

controller.on('direct_mention', (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    convo.say('You need to directly message me to start a Connect 4 game!');
    startGameInstructions(convo);
  });
});

module.exports = {
  teams,
};
