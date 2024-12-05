class GameManager {
    constructor(gameList) {
        this.gameList = gameList
    }

    //部屋のリストにある名前の部屋が存在するか調べる
    searchGame(searchName) {
        for (let i = 0; i < this.gameList.length; i++) {
            if (searchName === this.gameList[i].name) {
                return true
            }
        }
        return false
    }

    //部屋のリストの中からある部屋名の部屋を取得
    getGame(gameName) {
        for (let i = 0; i < this.gameList.length; i++) {
            if (gameName === this.gameList[i].name) {
                return this.gameList[i]
            }
        }
    }

    // toString() {
    //     return gameList.map((game) => {
    //         game.toString
    //     })
    // }
}

module.exports = GameManager