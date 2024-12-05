const { Socket } = require("socket.io-client")
const { Settlement } = require("./Building")

class Vertex {
    constructor(id, town, tradingPost) {
        this.id = id
        this.town = town
        this.tradingPost = tradingPost
        this.edges = []
    }

    connectEdges(edges, edgeIDList) {
        for (let i = 0; i < edgeIDList.length; i++) {
            this.edges.push(edges[edgeIDList[i]])
        }
    }

    canPutSettlement(player, config = 'default') {
        if (config === 'default') { //ゲーム開始時
            if ((player.resourceList.wood >= 1) && (player.resourceList.brick >= 1) && (player.resourceList.wool >= 1) && (player.resourceList.grain >= 1)) { //資源が足りているか判定
                for (let i = 0; i < this.edges.length; i++) {
                    if ((this.edges[i].road != null) && (this.edges[i].road.owner === player)) {
                        let targetVertex;
                        for (let j = 0; j < this.edges[i].vertices.length; j++) {
                            if (this != this.edges[i].vertices[j]) {
                                targetVertex = this.edges[i].vertices[j]
                                break;
                            }
                        }
                        if (targetVertex.town === null) {
                            for (let j = 0; j < targetVertex.edges.length; j++) {
                                if ((targetVertex.edges[j] != this.edges[i]) && (targetVertex.edges[j].road != null) && (targetVertex.edges[j].road.owner === player)) {
                                    return true //置ける
                                }
                            }
                        }
                    }
                }
                return false //周りに建造物がある
            } else {
                return false //資源が足りない
            }

        } else if (config === 'initial') { //初期配置時
            for (let i = 0; i < this.edges.length; i++) {
                let targetVertex;
                for (let j = 0; j < this.edges[i].vertices.length; j++) {
                    if (this != this.edges[i].vertices[j]) {
                        targetVertex = this.edges[i].vertices[j]
                        break;
                    }
                }
                if (targetVertex.town != null) { return false  } //周りに建造物がる
            }
            return true
        }
    }

    canPutCity(player) {
        if ((this.town instanceof Settlement) && (this.town.owner === player)) {
            if ((player.resourceList.grain >= 2) && (player.resourceList.ore >= 3)) {
                if (player.restOfCity > 0) {
                    return true //置ける
                } else {
                    return false //残りの都市がないためおけない
                } 
            } else {
                return false //資源が足りないためおけない
            }
        } else {
            return false //そもそも自身の開拓地が建設されていないためおけない
        }
    }

    activeTradingPost(player) {
        // 港がある場合おいたプレイヤーに公益ができるようになるようイベントを送信する
        if (this.tradingPost != null) {
            player.socket.emit('activateTradingPost', this.tradingPost)
        } else {console.log('ここに港はありません')}
    }

}

function generateVertexList() {
    const vertexList = []
    for (let i = 0; i < 54; i++) {
        vertexList.push(new Vertex(i, null, null))
    }
    return vertexList
}

module.exports = { Vertex, generateVertexList };