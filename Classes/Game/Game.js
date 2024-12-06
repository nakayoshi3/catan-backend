const { DKnight, DPoint, DBuildRoad, DMonopoly, DDrawCard } = require("./Development")

class Game {
    constructor(name, playerList) {
        this.name = name
        this.playerList = playerList
        this.board = null
        this.developmentList = { knight: 100, point: 5, buildRoad: 2, drawCard: 2, monopoly: 2 }
        this.turn = playerList[0]
        this.turns = 1
    }



    initDevelopmentList() {
        const initialDevList = []
        for (let i = 0; i < 14; i++) {
            initialDevList.push(new DKnight())
        }
        for (let i = 0; i < 5; i++) {
            initialDevList.push(new DPoint())
        }
        for (let i = 0; i < 2; i++) {
            initialDevList.push(new DBuildRoad(), new DDrawCard(), new DMonopoly())
        }

        for (let i = 24; i >= 0; i--) {
            // 0からiの範囲でランダムなインデックスを取得
            const randomIndex = Math.floor(Math.random() * (i + 1));

            this.developmentList.push(initialDevList[randomIndex])
            initialDevList.splice(randomIndex, 1)
        }
        console.log(this.developmentList)
    }

    monopoly(player, resource) {
        //全てのプレイヤーのある資源を1人に集約させる
        let resources = 0
        for (let i = 0; i < this.playerList.length; i++) {
            resources += this.playerList[i].resourceList[resource]
            this.playerList[i].resourceList[resource] = 0
        }
        player.resourceList[resource] = resources
    }

    updateMaxKnight(player) {
        //必要に応じて最大騎士力を更新し、更新されたかどうかを返す
        //引数はこのメソッドが呼び出された時に騎士カードを用いたプレイヤー
        const numberOfKnight = player.getOpenKnight()
        if ((numberOfKnight >= 3)) {
            let currentMaxKnight = -1
            for (let i = 0; i < this.playerList.length; i++) {
                const openKnight = this.playerList[i].getOpenKnight()
                if ((this.playerList[i] != player) && (currentMaxKnight < openKnight)) {
                    currentMaxKnight = openKnight
                }
            }
            if (currentMaxKnight < numberOfKnight) { //他のプレイヤーの騎士の数よりも自身が上回っていたら
                player.maxKnight = true
                player.point += 2
                //自身以外のプレイヤーのmaxKnightをfalseにする
                for (let i = 0; i < this.playerList.length; i++) {
                    if (this.playerList[i] != player) {
                        if (this.playerList[i].maxKnight = true) {
                            this.playerList[i].maxKnight = false
                            this.playerList[i].point -= 2
                        }
                    }
                }
                return true;
            } else { return false } //騎士の数は3枚以上あるが、他のプレイヤーより上回ってはいないため更新されない
        } else { return false } //公開された騎士が3枚以上でないため更新されない
    }

    drawRandomDevelopment(player) {
        //ランダムに1枚ハッテンカードを引き、プレイヤーの手札に加える
        //なんらかのトラブルで引けなかった際にはプレイヤーにメッセージを送信する
        //ポイントカードを引いた場合、その時点で1点加算する
        if (this.developmentList.knight === 0 && this.developmentList.point === 0 && this.developmentList.buildRoad === 0 && this.developmentList.drawCard === 0 && this.developmentList.monopoly === 0) {
            player.socket.emit('cannotDrawDevelopment', 'もう発展カードがありません')
        } else if (player.resourceList.wool >= 1 && player.resourceList.grain >= 1 && player.resourceList.ore >= 1) {
            //ランダムにthis.DevelopmentListから１枚ドローし、プレイヤーのResourceListに加える
            const knight = new Array(this.developmentList.knight).fill('knight');
            const point = new Array(this.developmentList.point).fill('point');
            const buildRoad = new Array(this.developmentList.buildRoad).fill('buildRoad');
            const drawCard = new Array(this.developmentList.drawCard).fill('drawCard');
            const monopoly = new Array(this.developmentList.monopoly).fill('monopoly');
            const DevList = [...knight, ...point, ...buildRoad, ...drawCard, ...monopoly]
            const Id = DevList.length //発展カードの残り枚数を以てIDとする

            const randomIndex = Math.floor(Math.random() * (DevList.length));
            const randomDevelopment = DevList[randomIndex]
            let result;
            if (randomDevelopment === 'knight') {
                this.developmentList.knight -= 1
                result = new DKnight(Id)
            } else if (randomDevelopment === 'point') {
                this.developmentList.point -= 1
                player.point += 1  //1点加算
                result = new DPoint(Id)
            } else if (randomDevelopment === 'buildRoad') {
                this.developmentList.buildRoad -= 1
                result = new DBuildRoad(Id)
            } else if (randomDevelopment === 'drawCard') {
                this.developmentList.drawCard -= 1
                result = new DDrawCard(Id)
            } else if (randomDevelopment === 'monopoly') {
                this.developmentList.monopoly -= 1
                result = new DMonopoly(Id)
            } else {
                console.log('detected a BUG in getRandomDevelopment')
            }

            player.reduceResourcePlayer({ wood: 0, brick: 0, wool: 1, grain: 1, ore: 1 })
            player.developmentList.push(result)
        } else {
            player.socket.emit('cannotDrawDevelopment', '資源が足りません')
        }
    }

    nextTurn(config = 'default') {
        //this.turnを次のターンのプレイイヤーに変更する
        const numberOfPlayers = 4 //ここを変える

        const currentIndex = this.playerList.indexOf(this.turn)
        this.turns += 1
        if (config === 'reverse') { //逆向き
            if (currentIndex != 0) { //現在のターンが先頭の人じゃないの場合
                this.turn = this.playerList[currentIndex - 1] //最後に人に戻る
            } else { //現在のターンが先頭の人
                this.turn = this.playerList[numberOfPlayers-1] //最後の人から繰り返す
            }
        } else if (config === 'stay') { //ターンは回さない

        } else {
            if (currentIndex != numberOfPlayers - 1) { //現在のターンが最後の人じゃないの場合
                this.turn = this.playerList[currentIndex + 1] //最後に人に戻る
            } else { //現在のターンが最後の人
                this.turn = this.playerList[0] //先頭の人から繰り返す
            }
        }
    }

    getPlayer(socket = null, name = null) {
        if (socket != null) {
            for (let i = 0; i < this.playerList.length; i++) {
                if (this.playerList[i].socket === socket) {
                    return this.playerList[i]
                }
            }
        } else if (name != null) {
            for (let i = 0; i < this.playerList.length; i++) {
                if (this.playerList[i].name === name) {
                    return this.playerList[i]
                }
            }
        }
        return null
    }

    getBurstPlayers() {
        //8枚以上資源を持っているプレイヤーのリストを返す
        const result = []
        for (let i = 0; i < this.playerList.length; i++) {
            if (this.playerList[i].getNumberOfResources() >= 8) {
                result.push(this.playerList[i])
            }
        }
        return result
    }

    assignColor() {
        const colorList = ['white', 'yellow', 'blue', 'red']
        for (let i = this.playerList.length - 1; i >= 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            this.playerList[i].color = colorList[randomIndex]
            colorList.splice(randomIndex, 1)
        }
    }

    propsPlayerList() {
        const result = []
        for (let i = 0; i < this.playerList.length; i++) {
            result.push(this.playerList[i].props())
        }
        return result
    }
}

module.exports = { Game }