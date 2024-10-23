//ゲームルームのクラス定義
//ゲームルーム名と所属するプレイヤーのリストをフィールド
class GameRoom {
    constructor(name, playerList) {
        this.name = name
        this.playerList = playerList
    }
}

const r1 = new GameRoom('test1', ['Ken'])
const r2 = new GameRoom('test2', ['Ken'])

module.exports = GameRoom;

