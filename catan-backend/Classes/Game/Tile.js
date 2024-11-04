class Tile {
    constructor(id, vertexList, edgeList, activeNumber, resource, knignt){
        this.id = id
        this.vertexList = vertexList
        this.edgeList = edgeList
        this.activeNumber = activeNumber
        this.resource = resource
        this.knignt = knignt
    }
}

module.exports = Tile;