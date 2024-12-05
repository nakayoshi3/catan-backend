class Edge {
    constructor(id) {
        this.id = id
        this.road = null
        this.vertices = []
    }

    canPutRoad(player, config='dafault') {
        //あるプレイヤーがこのエッジに道を置こうとした時、置けるかを判定する
        if (config === 'default') {
            if (!((player.resourceList.wood >= 1) && (player.resourceList.brick >= 1))) {
                return false //資源が足りなくて置けない
            }
        } 
        for (let i = 0; i < this.vertices.length; i++) {
            if (this.vertices[i].town != null) {
                if (this.vertices[i].town.owner === player) {
                    return true //おきたいエッジの隣の頂点に自身の建造物がある場合、置ける
                } //他の人の建物がある場合、こちら側は遮られる
            } else { //建物が何もない場合（この場合は隣接のエッジに自身の道があればよい）
                for (let j = 0; j < this.vertices[i].edges.length; j++) {
                    if ((this.vertices[i].edges[j].road != null) && (this.vertices[i].edges[j].road.owner === player)) {
                        return true //道が続いているため、置ける
                    }
                }
            }
        }
        return false //資源は足りるが建造物が続いておらず置けない
    }

}

function generateEdgeList() {
    const edgeList = []
    for (let i = 0; i < 72; i++) {
        edgeList.push(new Edge(i))
    }
    return edgeList
}


module.exports = { Edge, generateEdgeList };