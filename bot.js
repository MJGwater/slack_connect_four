require('./setup.js');
const BotKit = require('botkit');

const controller = BotKit.slackbot({
  debug: false,
});

controller.spawn({
  token: process.env.SLACK_BOT_TOKEN,
}).startRTM();

const { hears } = controller;

hears('^play <@([a-z0-9-._]+)>', 'direct_message', (bot, message) => {
  // console.log('message is: ', message);
  const player1 = message.user;
  const player2 = message.match[1];
  // console.log('player1 is: ', player1, 'player2 is: ', player2);
  bot.api.users.info({ user: player2 }, (err, player2) => {
    if (player2.user.is_bot || player2.user.id === 'USLACKBOT') {
      bot.reply(message, 'Bots can\'t play!');
    } else {
      bot.reply(message, 'Both players are human!');
    }
  });
});
