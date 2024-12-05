module.exports = (io, game) => {
    //呼び出すとそのタイミングで勝者判定を行う関数
    for(let i = 0; i < game.playerList.length; i++) {
        if (game.playerList[i].point >= 10) {
            io.to(`${game.name}`).emit('endGame', game.playerList[i].props())
            console.log('endGameイベントを送信_勝者は', game.playerList[i])
        }
    }
}

