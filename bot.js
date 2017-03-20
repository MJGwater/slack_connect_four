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

const privateConvoWithPlayer1 = (bot, message) => {
  return (err, convo) => {
    teams.get(message.team, (err2, teamData) => {
      // console.log('teamData is: ', teamData);
      convo.ask(`${teamData.boardStr} It's your turn. Choose a # between 1-7 to select a column.`);
    });
  }
}

hears('^play <@([a-z0-9-._]+)>', 'direct_message', (bot, message) => {
  // console.log('message is: ', message);
  const player1 = message.user;
  const player2 = message.match[1];
  // console.log('player1 is: ', player1, 'player2 is: ', player2);
  /*
  teams.get(message.team, (err, teamData) => {
    console.log('teamData is: ', teamData);
    if (teamData.player1 === message.user || teamData.player2 === message.user) {
      bot.reply('You can\'t start a new game because you\'re already in a game!')
    }
  });*/
  bot.api.users.info({ user: player2 }, (err, player2Info) => {
    if (player2Info.user.is_bot || player2Info.user.id === 'USLACKBOT') {
      bot.reply(message, 'Bots can\'t play!');
    } else {
      // bot.reply(message, 'Both players are human!');
      const newBoard = board.newBoardState;
      console.log('message.team is: ', message.team);
      const gameData = {
        id: message.team,
        player1,
        player2,
        boardArr: newBoard,
        boardStr: board.makeBoard(newBoard),
        numberInColumn: board.numberInColumn,
      };
      // console.log('gameData is: ', gameData);
      teams.save(gameData, (err1) => {
        if (err1) throw err1;
        console.log('teams is: ', teams);
        // teams.get(message.team, (err2, teamData) => {
          // console.log('teamData is: ', teamData);
        bot.startConversation(message, privateConvoWithPlayer1(bot, message));
      });
    }
  });
});

hears('^(?!^play (<@[a-z0-9-._]+>))', 'direct_message', (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    convo.say('I don\'t understand what you said. I exist to facilitate Connect4 games.');
    convo.say('To start a game type the word play and directly mention the name of the user you want to play. For example...');
    convo.say('play <@connect4>');
  });
});
