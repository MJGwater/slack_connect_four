const dotenv = require('dotenv');

dotenv.load();
const BotKit = require('botkit');

const controller = BotKit.slackbot({
  debug: false,
});

controller.spawn({
  token: process.env.SLACK_BOT_TOKEN,
}).startRTM();

module.exports = {
  controller,
};
