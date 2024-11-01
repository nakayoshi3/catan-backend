//ゲームルームのクラス定義
//ゲームルーム名と所属するプレイヤーのリストをフィールド
class GameRoom {
    constructor(name, playerList) {
        this.name = name
        this.playerList = playerList
    }
}

module.exports = GameRoom;

