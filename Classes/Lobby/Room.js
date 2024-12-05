//ゲームルームのクラス定義
//ゲームルーム名と所属するプレイヤーのリストをフィールド
class Room {
    constructor(name, playerList) {
        this.name = name
        this.playerList = playerList
    }

    toString() {
        return `Room(name: ${this.name}, players: ${this.playerList.join(", ")})`;
    }
}

module.exports = Room;