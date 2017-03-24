const checkIfPlayingGame = (player1, player2, teamData) => {
  if (teamData && teamData.games[player1] && (teamData.games[player1].player1 === player1 || teamData.games[player1].player2 === player1)) {
    return 'player 1';
  }
  if (teamData && teamData.games[player2] && (teamData.games[player2].player1 === player2 || teamData.games[player2].player2 === player2)) {
    return 'player 2';
  }
  return false;
};

module.exports = {
  checkIfPlayingGame,
};
