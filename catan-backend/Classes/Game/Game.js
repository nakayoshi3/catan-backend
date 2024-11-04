class Game {
    constructor(playerList, board) {
        this.playerList = playerList
        this.board = board
        this.restOfDevelopment = 25
        this.turn = playerList[0]
    }
}

module.exports = {Game}