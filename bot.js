require('./setup.js');
const BotKit = require('botkit');

const controller = BotKit.slackbot({
  debug: false,
});

controller.spawn({
  token: process.env.SLACK_BOT_TOKEN,
}).startRTM();

const { hears } = controller;

hears('hi', 'direct_message', (bot, message) => {
  bot.reply(message, 'how you doin?');
});
