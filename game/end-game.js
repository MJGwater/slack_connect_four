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

module.exports = {
  gameOverMessages,
  postToGeneralChannelId,
};
