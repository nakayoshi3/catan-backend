const { Settlement, City } = require("./Building")

class Tile {
    constructor(id, vertexList, edgeList, activeNumber, resource, knight) {
        this.id = id
        this.vertexList = vertexList
        this.edgeList = edgeList
        this.activeNumber = activeNumber
        this.resource = resource
        this.knight = knight
    }

    distribute() {
        if (this.knight === false) {
            for (let i = 0; i < this.vertexList.length; i++) {
                if (this.vertexList[i].town instanceof Settlement) {
                    this.vertexList[i].town.owner.addResource(this.resource, 1)
                } else if (this.vertexList[i].town instanceof City) {
                    this.vertexList[i].town.owner.addResource(this.resource, 2)
                }
            }
        }
    }

    getPlayer() {
        //タイルの周りにいるプレイヤーをリストで取得
        const result = []
        for (let i = 0; i < this.vertexList.length; i++) {
            if (((this.vertexList[i].town instanceof Settlement) || (this.vertexList[i].town instanceof City)) && (!(result.includes(this.vertexList[i].town.owner)))) {
                result.push(this.vertexList[i].town.owner)
            }
        }
        return result
    }

    hasVertex(id) {
        for (let i =0; i <this.vertexList.length; i++) {
            if (this.vertexList[i].id === id) {
                return true
            }
        }
        return false
    }

    connectVertexEdge() {
        //少し難しいことしてる。タイルのエッジと頂点のうち隣接しているものを全て繋ぐ

        const subConnect = (vertexID, edgeIDList) => {
            //頂点に対して隣接するエッジを接続するサブ関数
            const lst = []
            for (let i = 0; i < this.vertexList[vertexID].edges.length; i++) {
                lst.push(this.vertexList[vertexID].edges[i].id) //もともとのidリストを作る
            }

            for (let i = 0; i < edgeIDList.length; i++) {
                if (!(lst.includes(this.edgeList[edgeIDList[i]].id))) {
                    this.vertexList[vertexID].edges.push(this.edgeList[edgeIDList[i]])
                }
            }
        }
        subConnect(0, [0, 2])
        subConnect(1, [0, 1])
        subConnect(2, [1, 3])
        subConnect(3, [2, 4])
        subConnect(4, [4, 5])
        subConnect(5, [3, 5])

        //エッジに対して頂点を接続（1つのエッジに対して頂点は必ず2個）
        this.edgeList[0].vertices = [this.vertexList[0], this.vertexList[1]]
        this.edgeList[1].vertices = [this.vertexList[1], this.vertexList[2]]
        this.edgeList[2].vertices = [this.vertexList[0], this.vertexList[3]]
        this.edgeList[3].vertices = [this.vertexList[2], this.vertexList[5]]
        this.edgeList[4].vertices = [this.vertexList[3], this.vertexList[4]]
        this.edgeList[5].vertices = [this.vertexList[4], this.vertexList[5]]
    }
}

module.exports = Tile;