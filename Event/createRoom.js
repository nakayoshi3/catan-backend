const { Game } = require('../Classes/Game/Game');
const Player = require('../Classes/Game/Player')

module.exports = (socket, gameManager) => {
    socket.on('createRoom', (playerRoomInfo) => {
        if (gameManager.searchGame(playerRoomInfo.room)) {
            socket.emit('existRoom', true)
            console.log('existRoomイベントを送信しました')
        } else {
            const player = new Player(playerRoomInfo.player, socket)
            const newGame = new Game(playerRoomInfo.room, [player])
            gameManager.gameList.push(newGame)
            socket.join(`${playerRoomInfo.room}`);
            socket.emit('existRoom', false)
            console.log('部屋', playerRoomInfo, 'が新たに作られました')
        }
        // console.log('現在のルームリストはこちらです', gameManager.gameList, '\n')
    });
}