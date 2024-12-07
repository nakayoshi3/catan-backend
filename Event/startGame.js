const { getModeForResolutionAtIndex } = require("typescript")
const { Game } = require("../Classes/Game/Game")
const GameManager = require("../Classes/Game/GameManager")
const { Road, Settlement, City } = require("../Classes/Game/Building")
const Tile = require("../Classes/Game/Tile")
const Player = require("../Classes/Game/Player")
const { Wood, Brick, Wool, Grain, Ore } = require("../Classes/Game/Resource")


module.exports = (io, socket, gameManager) => {

    socket.on('startGame', (room) => {

        const burstPlayers = [] // バーストした時バーストしたプレイヤーを入れておく

        console.log('startGameイベントを受け取りました') //4つ受け取るはず
        const game = gameManager.getGame(room)
        const initTurn = game.playerList.length
        const player = game.getPlayer(socket)
        io.to(`${game.name}`).emit('startTurn')
        if (socket === game.turn.socket) {
            socket.emit('yourTurn', true) //初めのターンの人に送信（デフォルトはルームオーナー）
        }
        console.log(game.turn.name, 'にyourTurnイベントを送信')


        socket.on('endTurn', () => {
            console.log(`endturnイベントを受け取りました`)
            if (game.turns <= initTurn) { //初めの１巡目
                if (player.restOfSettlement === 5 || player.restOfRoad === 15) { //配置できていないとき
                    socket.emit('endTurn', false)
                } else {
                    socket.emit('endTurn', true)
                    if (game.turns === initTurn) {//折り返しならまた自分のターン
                        game.nextTurn('stay')
                    } else {
                        game.nextTurn()
                    }
                    game.turn.socket.emit('yourTurn', true)
                }
            } else if ((initTurn < game.turns) && (game.turns <= initTurn * 2)) { //2巡目
                if (player.restOfSettlement >= 4 || player.restOfRoad >= 14) { //配置できていないとき
                    socket.emit('endTurn', false)
                } else {
                    socket.emit('endTurn', true)
                    if (game.turns === initTurn * 2) { //初期配置がこのターンで終了 (2回目の折り返し)
                        game.nextTurn('stay') 
                        io.to(`${game.name}`).emit('endSetUp', game.turn.name)
                    } else {
                        game.nextTurn('reverse')
                        game.turn.socket.emit('yourTurn', true)
                    }
                }
            } else { //初期配置じゃない時
                socket.emit('endTurn', true)
                player.enableUseDevelopment()
                game.nextTurn()
                game.turn.socket.emit('yourTurn', false)
                io.to(`${game.name}`).emit('distributeResources', game.propsPlayerList())
            }
        })

        socket.on('rollDice', () => {
            const randomDice1 = 1 + Math.floor(Math.random() * (5 + 1)); //1から6のランダムなインデックスを取得
            const randomDice2 = 1 + Math.floor(Math.random() * (5 + 1)); //1から6のランダムなインデックスを取得
            const dice = randomDice1 + randomDice2

            io.to(`${game.name}`).emit('rollDice', dice)
            console.log('rollDiceイベントを送信', dice)
            if (dice != 7) {
                game.board.distribute(dice)
                io.to(`${game.name}`).emit('distributeResources', game.propsPlayerList())
                console.log('distributeResourcesイベントを送信', game.propsPlayerList())
            } else { //7が出た時
                //バースト判定
                const bs = game.getBurstPlayers()
                console.log(bs)
                burstPlayers.push(...bs)
                console.log(burstPlayers)
                if (burstPlayers.length > 0) { //誰かバーストしている場合
                    console.log('バーストしました')
                    for (let i = 0; i < burstPlayers.length; i++) {
                        burstPlayers[i].socket.emit('burst', Math.floor(burstPlayers[i].getNumberOfResources() / 2))
                    }
                } else { //誰もバーストしていない場合
                    socket.emit('knight')
                }
            }
        })

        socket.on('burst', (resourceProps) => {
            if (player.hasResources(resourceProps)) {
                player.reduceResourcePlayer(resourceProps) //捨てたカードの分だけ減らす
                burstPlayers.splice(burstPlayers.indexOf(player), 1)
                socket.emit('canburst', true)
                io.to(`${game.name}`).emit('distributeResources', game.propsPlayerList()) //更新
                if (burstPlayers.length === 0) {
                    game.turn.socket.emit('knight')
                }
            } else {
                socket.emit('canburst', false)
            }
        })

        socket.on('moveKnight', (id) => {
            const preKnightID = game.board.knight
            game.board.knight = id
            game.board.tileList[preKnightID].knight = false
            game.board.tileList[id].knight = true
            const targetPlayers = game.board.tileList[id].getPlayer()
            const targetPlayerNameList = []
            for (let i = 0; i < targetPlayers.length; i++) {
                if (targetPlayers[i].name != player.name) {
                    targetPlayerNameList.push(targetPlayers[i].name)
                }
            }
            io.to(`${game.name}`).emit('putKnight', id)
            if (targetPlayerNameList.length > 0) {
                socket.emit('drawCard', targetPlayerNameList)
                console.log('drawCardイベント送信', targetPlayerNameList)
            } else {
                io.to(`${game.name}`).emit('cannotDrawCard', player.name + 'は何も奪えませんでした')
            }
        })

        socket.on('drawCard', (drawnPlayerName) => {
            const drawnPlayer = game.getPlayer(null, drawnPlayerName)
            const resource = drawnPlayer.getRandomResource()
            console.log(resource, 'を引きました')
            //引いたカードを追加する
            if (resource != 'empty') {
                if (resource === 'wood') {
                    player.resourceList.wood += 1
                } else if (resource === 'brick') {
                    player.resourceList.brick += 1
                } else if (resource === 'wool') {
                    player.resourceList.wool += 1
                } else if (resource === 'grain') {
                    player.resourceList.grain += 1
                } else { //oreの場合
                    player.resourceList.ore += 1
                }
                io.to(`${game.name}`).emit('distributeResources', game.propsPlayerList())
                console.log('カードを引き、更新するためのイベントを送信', game.propsPlayerList())
            } else {
                io.to(`${game.name}`).emit('showMessage', `${drawnPlayerName}は資源を持っていないので何も奪えませんでした`)
            }

            io.to(`${game.name}`).emit('distributeResources', game.propsPlayerList())
            console.log('カードを引き、更新するためのイベントを送信', game.propsPlayerList())
        })

        socket.on('putSettlement', (id) => {
            if (game.turns <= initTurn * 2) {
                if (game.board.vertices[id].canPutSettlement(player, 'initial')) {
                    game.board.vertices[id].town = new Settlement(player)
                    player.restOfSettlement -= 1
                    player.point += 1
                    if (initTurn < game.turns) { //もし２巡目なら周りのタイルの資源を追加する
                        const tiles = game.board.getTilesFromId(id)
                        const props = { wood: 0, brick: 0, wool: 0, grain: 0, ore: 0 }
                        for(let i = 0;i <tiles.length;i++) {
                            if (tiles[i].resource instanceof Wood) {
                                props.wood = 1
                            } else if (tiles[i].resource instanceof Brick) {
                                props.brick = 1
                            } else if (tiles[i].resource instanceof Wool) {
                                props.wool = 1
                            } else if (tiles[i].resource instanceof Grain) {
                                props.grain = 1
                            } else if (tiles[i].resource instanceof Ore) {
                                props.ore = 1
                            }
                        }
                        player.addResourcePlayer(props)
                    }
                    io.to(`${game.name}`).emit('putInitialSettlement', { playerProps: player.props(), id: id, color: player.color })
                    game.board.vertices[id].activeTradingPost(player) // socket.emit('activateTradingPost')してる
                } else {
                    socket.emit('cannnotPutSettlement')
                }
            } else {//対戦開始
                if (game.board.vertices[id].canPutSettlement(player)) {
                    game.board.vertices[id].town = new Settlement(player)
                    player.resourceList.wood -= 1
                    player.resourceList.brick -= 1
                    player.resourceList.wool -= 1
                    player.resourceList.grain -= 1
                    player.restOfSettlement -= 1
                    player.point += 1
                    game.board.vertices[id].activeTradingPost(player) // socket.emit('activateTradingPost')してる
                    io.to(`${game.name}`).emit('putSettlement', { playerProps: player.props(), id: id, color: player.color })
                } else {
                    socket.emit('cannnotPutSettlement')
                }
            }
        })

        socket.on('putCity', (id) => {
            if (game.turns <= initTurn * 2) { //初期配置では都市化はできない
                socket.emit('cannotPutCity')
                console.log('cannotPutCityイベント送信')
            } else {
                if (game.board.vertices[id].canPutCity(player)) {
                    game.board.vertices[id].town = new City(player)
                    player.resourceList.grain -= 2
                    player.resourceList.ore -= 3
                    player.restOfCity -= 1
                    player.restOfSettlement += 1
                    player.point += 1
                    io.to(`${game.name}`).emit('putCity', { playerProps: player.props(), id: id, color: player.color })
                } else {
                    socket.emit('cannotPutCity')
                    console.log('cannotPutCityイベント送信')
                }
            }
        })

        socket.on('putRoad', (id) => {
            if (game.turns <= initTurn * 2) { //初期配置時
                if (game.board.edges[id].canPutRoad(player, 'initial')) {
                    game.board.edges[id].road = new Road(player)
                    player.restOfRoad -= 1
                    io.to(`${game.name}`).emit('putInitialRoad', { playerProps: player.props(), id: id, color: player.color })
                } else {
                    socket.emit('cannotPutRoad')
                    console.log('cannotPutRoadイベント送信')
                }
            } else {
                if (game.board.edges[id].canPutRoad(player, 'default')) {
                    game.board.edges[id].road = new Road(player)
                    player.resourceList.wood -= 1
                    player.resourceList.brick -= 1
                    player.restOfRoad -= 1
                    io.to(`${game.name}`).emit('putRoad', { playerProps: player.props(), id: id, color: player.color })
                } else {
                    socket.emit('cannotPutRoad')
                    console.log('cannotPutRoadイベント送信')
                }
            }
        })

        socket.on('drawDevelopment', () => {
            game.drawRandomDevelopment(player)
            io.to(`${game.name}`).emit('distributeResources', game.propsPlayerList())
            console.log('カードを引き、更新するためのイベントを送信', game.propsPlayerList())
        })

        socket.on('useDevelopment', (development) => {
            const usedDevelopment = player.getDevelopment(development.id)
            usedDevelopment.isOpen = true
            usedDevelopment.canUse = false
            if (development.name === 'knight') {
                if (game.updateMaxKnight(player)) { //騎士力が更新
                    socket.emit('maxKnight')
                    socket.broadcast.to(`${game.name}`).emit('showMessage', `${player.name}が最大騎士力を獲得しました！`)
                } else { //更新されない
                    socket.emit('knight')
                    socket.broadcast.to(`${game.name}`).emit('showMessage', `${player.name}が騎士カードを発動しました`)
                }

            } else if (development.name === 'buildRoad') {
                socket.emit('buildRoad', { restOfRoad: 2, message: '街道を置く場所を2箇所決めてください' })
                socket.broadcast.to(`${game.name}`).emit('showMessage', `${player.name}が街道建設カードを発動しました`)
            } else if (development.name === 'drawCard') {
                socket.emit('drawResources', { restOfDraw: 2, message: '欲しい資源を合計2回選択してください' })
                socket.broadcast.to(`${game.name}`).emit('showMessage', `${player.name}が発見カードを発動しました`)
            } else if (development.name === 'monopoly') {
                socket.emit('monopoly')
                socket.broadcast.to(`${game.name}`).emit('showMessage', `${player.name}が独占カードを発動しました！！`)
            } else { console.log('Error in useDevelopment') }
            io.to(`${game.name}`).emit('distributeResources', game.propsPlayerList())
        })

        socket.on('buildRoad', (roadProps) => {
            console.log('buildRoad', roadProps)
            if (game.board.edges[roadProps.id].canPutRoad(player, 'initial')) {
                game.board.edges[roadProps.id].road = new Road(player)
                player.restOfRoad -= 1
                //プレイヤーの
                io.to(`${game.name}`).emit('putRoad', { playerProps: player.props(), id: roadProps.id, color: player.color })
                const message = (roadProps.restOfRoad === 2) ? "もう1箇所においてください" : "全て置き終わりました"
                socket.emit('buildRoad', { restOfRoad: roadProps.restOfRoad - 1, message: message }) //送るのは0か1になるはず
            } else {
                socket.emit('buildRoad', { restOfRoad: roadProps.restOfRoad, message: 'そこにはおけません' })
            }
        })

        socket.on('drawResources', (resourceProps) => {
            console.log('drawResourceイベントを受け取りました', resourceProps)
            let message = ''
            if (resourceProps.wood != 0) {
                player.resourceList.wood += resourceProps.wood
                message = message + `木を${resourceProps.wood}枚　`
            }
            if (resourceProps.brick != 0) {
                player.resourceList.brick += resourceProps.brick
                message = message + `土を${resourceProps.brick}枚　`
            }
            if (resourceProps.wool != 0) {
                player.resourceList.wool += resourceProps.wool
                message = message + `羊を${resourceProps.wool}枚　`
            }
            if (resourceProps.grain != 0) {
                player.resourceList.grain += resourceProps.grain
                message = message + `土を${resourceProps.grain}枚　`
            }
            if (resourceProps.ore != 0) {
                player.resourceList.ore += resourceProps.ore
                message = message + `土を${resourceProps.ore}枚　`
            }
            io.to(`${game.name}`).emit('distributeResources', game.propsPlayerList())
            io.to(`${game.name}`).emit('showMessage', player.name + 'は' + message + '獲得しました')
        })

        socket.on('monopoly', (resource) => {
            console.log('monopolyイベントを受け取りました', resource)
            game.monopoly(player, resource)
            io.to(`${game.name}`).emit('distributeResources', game.propsPlayerList())
            io.to(`${game.name}`).emit('showMessage', player.name + 'は' + resource + 'を独占しました')
        })

        socket.on('tradePlayer', tradeProps => {
            console.log('tradePlayerイベントを受信', tradeProps)
            if (player.hasResources(tradeProps.sendResource)) { //資源が足りる場合
                const targetPlayer = game.getPlayer(null, tradeProps.targetPlayer)
                console.log('111')
                const sResource = tradeProps.sendResource
                const rResource = tradeProps.requestResource
                targetPlayer.socket.emit('receiveTrade', { targetPlayer: player.name, sendResource: rResource, receiveResource: sResource })
            } else {//そもそも資源が足りない場合
                socket.emit('showMessage', 'あなたの資源が足りません')
            }
        })

        socket.on('successTrade', (tradeProps) => {
            console.log('successTrade', tradeProps)
            const requestPlayer = game.getPlayer(null, tradeProps.targetPlayer)
            if (player.hasResources(tradeProps.sendResource)) { //本当に成功した場合
                player.addResourcePlayer(tradeProps.receiveResource)
                player.reduceResourcePlayer(tradeProps.sendResource)
                requestPlayer.addResourcePlayer(tradeProps.sendResource)
                requestPlayer.reduceResourcePlayer(tradeProps.receiveResource)
                io.to(`${game.name}`).emit('distributeResources', game.propsPlayerList())
                io.to(`${game.name}`).emit('showMessage', `${player.name}と${requestPlayer.name}の取引が成立しました😉`)
            } else { //リクエストを受ける側が資源がないのに取引を受けた場合
                socket.emit('showMessage', '取引に応じる資源がありませんでした')
                requestPlayer.socket.emit('showMessage', '取引は拒否されました')
            }

        })
        socket.on('failTrade', (player) => {
            console.log('failTrade', player)
            requestPlayer.socket.emit('showMessage', '取引は拒否されました')
        })

        socket.on('trade2to1', (tradeProps) => {
            console.log('trade2to1', tradeProps)
            if (player.resourceList[tradeProps.sendResource] < 2) {
                socket.emit('showMessage', '資源が足りません')
            } else {
                player.resourceList[tradeProps.sendResource] -= 2
                player.resourceList[tradeProps.requestResource] += 1
                io.to(`${game.name}`).emit('distributeResources', game.propsPlayerList())
                io.to(`${game.name}`).emit('showMessage', `${player.name}が2:1交換で${tradeProps.requestResource}を手に入れました`)
            }
        })

        socket.on('trade3to1', (tradeProps) => {
            console.log('trade3to1', tradeProps)
            if (player.hasResources(tradeProps.sendResource)) {
                player.reduceResourcePlayer(tradeProps.sendResource)
                player.resourceList[tradeProps.requestResource] += 1
                io.to(`${game.name}`).emit('distributeResources', game.propsPlayerList())
                io.to(`${game.name}`).emit('showMessage', `${player.name}は3:1交換で${tradeProps.requestResource}を手に入れました`)
            } else { //足りない場合
                socket.emit('showMessage', '資源が足りません')
            }
        })

        socket.on('trade4to1', (tradeProps) => {
            console.log('trade4to1', tradeProps)
            if (player.hasResources(tradeProps.sendResource)) {
                player.reduceResourcePlayer(tradeProps.sendResource)
                player.resourceList[tradeProps.requestResource] += 1
                io.to(`${game.name}`).emit('distributeResources', game.propsPlayerList())
                io.to(`${game.name}`).emit('showMessage', `${player.name}は4:1交換で${tradeProps.requestResource}を手に入れました`)
            } else { //足りない場合
                socket.emit('showMessage', '資源が足りません')
            }
        })

    })
}

