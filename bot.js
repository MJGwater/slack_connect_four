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
  // console.log('teamData is: ', teamData);
  if (teamData && teamData.games[player1] && (teamData.games[player1].player1 === player1 || teamData.games[player1].player2 === player1)) {
    return 'player 1';
  }
  if (teamData && teamData.games[player2] && (teamData.games[player2].player1 === player2 || teamData.games[player2].player2 === player2)) {
    return 'player 2';
  }
  return false;
};

const postToGeneralChannelId = (bot, messages) => {
  bot.api.channels.list({}, (err, response) => {
    // console.log('response is: ', response);
    let generalChannelId = '';
    for (let i = 0; i < response.channels.length; i++) {
      // console.log('response[i] is: ', response);
      if (response.channels[i].name === 'general') {
        // console.log('channel id is:', channel.id);
        generalChannelId = response.channels[i].id;
      }
    }
    for (let i = 0; i < messages.length; i++) {
      // console.log('generalChannelId is: ', generalChannelId);
      // console.log('messages[i] is', messages[i]);
      bot.say({
        text: messages[i],
        channel: generalChannelId,
      });
    }
  });
};

const startPrivateConvo = (player, bot, teamID) => {
  // console.log('player is: ', player);
  bot.startPrivateConversation({ user: player }, (err, convo) => {
    teams.get(teamID, (err2, teamData) => {
      // console.log('teamData is: ', teamData);
      // const theRightGame
          // console.log('i think i\'m never hitting here');
      const theRightGame = teamData.games[player];
      let color = '';
      if (theRightGame.player1 === player) {
        color = 'black';
      } else {
        color = 'red';
      }
      // console.log('theRightGame is: ', theRightGame);
      let aWinner;
      let aTie;
      convo.ask(`${theRightGame.boardStr} It's your turn. Choose a # between 1-7 to select a column.`, [{
        pattern: '^[1-7]{1}$',
        callback: (response, convo) => {
          // console.log('hits here. response is: ', response);
          // console.log('response is: ', response);
          const indexChosen = Number(response.text) - 1;
          // condition saying if there is already a 5 in the value at indexChosen
          if (theRightGame.numberInColumn[indexChosen] === 6) {
            // say that the column is full. "This column is full. Please choose another column"
            convo.say('This column is full. Please choose another column.');
            // repeat the question
            convo.repeat();
            convo.next();
          } else {
            theRightGame.boardArr[5 - theRightGame.numberInColumn[indexChosen]][indexChosen] = color;
            theRightGame.numberInColumn[indexChosen]++;
            theRightGame.boardStr = board.makeBoard(theRightGame.boardArr);
            // console.log('theRightGame.numberInColumn is: ', theRightGame.numberInColumn);
            aWinner = board.checkForWin(theRightGame.boardArr);
            aTie = board.checkForTie(theRightGame.numberInColumn);
            if (aWinner) {
              convo.say(`${theRightGame.boardStr}`);
              convo.say(`Game over! <@${player}> wins!`);
              const playerNotCurrentlyTakingTurn = player === theRightGame.player1 ? theRightGame.player2 : theRightGame.player1;
              bot.startPrivateConversation({ user: playerNotCurrentlyTakingTurn }, (err, convo) => {
                convo.say(`${theRightGame.boardStr}`);
                convo.say(`Game over! <@${player}> wins`);
              });
              // delaying post of results to general channel so the player can see them first
              setTimeout(postToGeneralChannelId.bind(null, bot, [`<@${player}> has defeated <@${playerNotCurrentlyTakingTurn}> in Connect 4.`, 'If you want to get in on the Connect 4 action direct message me!']), 2500);
              /* postToGeneralChannelId(bot, [`<@${player}> has defeated <@${playerNotCurrentlyTakingTurn}> in Connect 4.`, 'If you want to get in on the Connect 4 action direct message me!']);*/
              delete teamData.games[theRightGame.player1];
              delete teamData.games[theRightGame.player2];
            } else if (aTie) {
              convo.say(`${theRightGame.boardStr}`);
              convo.say(`Game over! <@${theRightGame.player1}> and <@${theRightGame.player2}> have tied!`);
              const playerNotCurrentlyTakingTurn = player === theRightGame.player1 ? theRightGame.player2 : theRightGame.player1;
              bot.startPrivateConversation({ user: playerNotCurrentlyTakingTurn }, (err, convo) => {
                convo.say(`${theRightGame.boardStr}`);
                convo.say(`Game over! <@${theRightGame.player1}> and <@${theRightGame.player2}> have tied!`);
              });
              // delaying post of results to general channel so the player can see them first
              setTimeout(postToGeneralChannelId.bind(null, bot, [`<@${player} has tied <@${playerNotCurrentlyTakingTurn}> in Connect 4.`, 'If you want to get in on the Connect 4 action direct message me!']), 2500);
              /* postToGeneralChannelId(bot, [`<@${player} has tied <@${playerNotCurrentlyTakingTurn}> in Connect 4.`, 'If you want to get in on the Connect 4 action direct message me!']);*/
              delete teamData.games[theRightGame.player1];
              delete teamData.games[theRightGame.player2];
            } else {
              convo.say(`You responded ${response.text}. The new board is \n${theRightGame.boardStr}`);
              convo.say('We\'ll let you know when its your turn again.');
            }
            // console.log('response is: ', response);
            convo.next();
          }
        },
      }, {
        default: true,
        callback: (response, convo) => {
          // console.log('response is: ', response);
          convo.say('Invalid move! Please type a number from 1-7 to select a column.');
          convo.repeat();
          convo.next();
        },
      },
      ], { key: 'move' });
      convo.on('end', (convo) => {
        if (convo.status === 'completed') {
          // console.log('this conversation is over!');
          // console.log('message is: ', message);
          // console.log('response is: ', response);
          if (aWinner || aTie) {
            // console.log('the game is over!');
            // console.log('teamData is: ', teamData);
              /* teams.save(teamData, (err) => {
                if (err) throw err;
              });*/
          } else if (player === theRightGame.player1) {
            startPrivateConvo(theRightGame.player2, bot, teamID);
          } else {
            startPrivateConvo(theRightGame.player1, bot, teamID);
          }
        }
        /* if (convo.status === 'stopped') {
          console.log('the convo status is stopped!');
        }*/
      });
    });
  });
};

hears('^play <@([a-z0-9-._]+)>', 'direct_message', (bot, message) => {
  // console.log('message is: ', message);
  const player1 = message.user;
  const player2 = message.match[1];
  // console.log('player1 is: ', player1, 'player2 is: ', player2);
  if (player1 === player2) {
    bot.reply(message, 'You can\'t play Connect 4 with yourself!');
  } else {
    teams.get(message.team, (err, teamData) => {
      // console.log('teamData is: ', teamData);
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
            // bot.reply(message, 'Both players are human!');
            const newBoard = [[0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]];
            const newBoardStr = board.makeBoard(newBoard);
            const numberInColumn = [0, 0, 0, 0, 0, 0, 0];
            // console.log('message.team is: ', message.team);
            teamData = teamData || {
              id: message.team,
              games: {},
            };
            const gameData = {
              player1,
              player2,
              boardArr: newBoard,
              boardStr: newBoardStr,
              numberInColumn,
            };
            teamData.games[player1] = gameData;
            teamData.games[player2] = gameData;
            // console.log('gameData is: ', gameData);
            // console.log('teamData is: ', teamData);
            teams.save(teamData, (err1) => {
              if (err1) throw err1;
              // console.log('teams is: ', teams);
              // teams.get(message.team, (err2, teamData) => {
                // console.log('teamData is: ', teamData);
              bot.startPrivateConversation({ user: player2 }, (err, convo) => {
                convo.say(`<@${player1}> has started a game of connect 4 with you! We'll let you know when its your turn.`);
                convo.next();
                convo.on('end', (convo) => {
                  if (convo.status === 'completed') {
                    startPrivateConvo(player1, bot, message.team);
                  }
                });
              });
            });
          }
        });
      }
    });
  }
});

hears('^(?!^play (<@[a-z0-9-._]+>))', 'direct_message', (bot, message) => {
  // console.log('message is :', message);
  // postToGeneralChannelId(bot, ['yo general!']);
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
