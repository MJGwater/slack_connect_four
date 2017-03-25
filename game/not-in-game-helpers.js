const checkIfPlayingGame = (player1, player2, teamData) => {
  if (teamData && teamData.games[player1] && (teamData.games[player1].player1 === player1 || teamData.games[player1].player2 === player1)) {
    return 'player 1';
  }
  if (teamData && teamData.games[player2] && (teamData.games[player2].player1 === player2 || teamData.games[player2].player2 === player2)) {
    return 'player 2';
  }
  return false;
};

const startGameInstructions = (convo) => {
  convo.say('To start a game type the word play and directly mention the name of the user you want to play. For example...');
  convo.say('play <@connect4>');
  convo.say('But don\'t try to play me! You can currently only play human users.');
};

module.exports = {
  checkIfPlayingGame,
  startGameInstructions,
};
