let game = {
    playerCount: 0,
    letters: 6,
    players: {}
}

addPlayer = (game, name) => {
    game.players.name = {
        score: 0,
        wins: 0,
        losses: 0,
        words: {}
    }
}