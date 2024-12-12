const { generateBoard, Board } = require("../Classes/Game/Board");
const { Game } = require("../Classes/Game/Game");
const Player = require("../Classes/Game/Player");
const startGame = require("./startGame");

module.exports = (io, socket, gameManager) => {

    socket.on('joinRoom', (playerRoomInfo) => {
        console.log('joinRoomイベントを受け取りました')
        if (gameManager.searchGame(playerRoomInfo.room)) {
            const targetGame = gameManager.getGame(playerRoomInfo.room)
            if (targetGame.playerList.length <= numberOfPlayer-1) {
                const player = new Player(playerRoomInfo.player, socket)
                targetGame.playerList.push(player)
                socket.join(`${playerRoomInfo.room}`);
                socket.emit('roomFound', true)
                console.log('emit roomFound Event with a value true')

                if (targetGame.playerList.length >= numberOfPlayer) { //デバッグ用で2
                    const board = generateBoard()
                    board.addRandomResource()
                    board.addActivNumberBoard('default')
                    targetGame.board = board
                    targetGame.assignColor()

                    const emitedValue = { playerList: targetGame.propsPlayerList(), room: playerRoomInfo.room, board: [] }
                    for (let i = 0; i < board.tileList.length; i++) {
                        emitedValue.board.push({ id: board.tileList[i].id, resource: board.tileList[i].resource.serialize(), activeNumber: board.tileList[i].activeNumber })
                    }
                    io.to(`${playerRoomInfo.room}`).emit('startGame', emitedValue)
                    console.log('emmit startGame Event with タイル番号と資源、アクティブナンバーの対応のリスト', emitedValue)
                }
            } else {
                socket.emit('roomMaxim')
                console.log('emit roomMaxim Event')
            }
        } else {
            socket.emit('roomFound', false)
            console.log('emit roomFound Event with a value false')
        }
        // console.log('現在のルームリストはこちらです', gameManager.gameList, '\n') // デバッグ用だから消さないでねー
    });
}