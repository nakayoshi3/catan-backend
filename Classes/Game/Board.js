const Tile = require('./Tile');
const { Wood, Brick, Wool, Grain, Ore, Desert } = require('./Resource')
const { generateVertexList } = require('./Vertex')
const { generateEdgeList } = require('./Edge')

class Board {
    constructor(tileList) {
        this.tileList = tileList
        this.knight = -1
        this.vertices = []
        this.edges = []
    }

    getTiles(number) {
        const result = []
        for (let i = 0; i < this.tileList.length; i++) {
            if (this.tileList[i].activeNumber === number) {
                result.push(this.tileList[i])
            }
        }
        return result;
    }

    distribute(number) {
        const targetTiles = this.getTiles(number)
        for (let i = 0; i < targetTiles.length; i++) {
            targetTiles[i].distribute()
        }
    }

    addTile(vertices, edges, id, vertexIDList, edgeIDList) {
        const tile = new Tile(id, [], [], null, null, false)
        for (let i = 0; i < 6; i++) {
            tile.vertexList.push(vertices[vertexIDList[i]])
            tile.edgeList.push(edges[edgeIDList[i]])
        }
        this.tileList.push(tile)
    }

    addActivNumberBoard(config) {

        //workListに応じて実際に数字をBoardのそれぞれのタイルに割り当てていくサブ関数
        const addActivNumberDefault = (workList) => {
            const numberList = [5, 2, 6, 3, 8, 10, 9, 12, 11, 4, 8, 10, 9, 4, 5, 6, 3, 11] //a,b,c,...に対応してる

            for (let i = 0, j = 0; i < workList.length; i++) {
                if (!(this.tileList[workList[i]].resource instanceof Desert)) {
                    this.tileList[workList[i]].activeNumber = numberList[j]
                    // console.log(this.tileList[workList[i]].id, 'に', numberList[j], 'が割り当てられました')
                    j++
                } else {
                    this.knight = workList[i]
                    // console.log(this.tileList[workList[i]].id, 'のResourceはDesertでした')
                }
            }
        }

        //いつもやってるかたんの数字チップの配置の仕方
        //適当にサイコロを振って出た数1~6(0~5)に応じてスタート位置を変えてそのタイルから時計回りに数字チップを置いていく
        if (config === 'default') {
            const randomIndex = Math.floor(Math.random() * 6)
            if (randomIndex === 0) {
                const workList = [0, 1, 2, 6, 11, 15, 18, 17, 16, 12, 7, 3, 4, 5, 10, 14, 13, 8, 9]
                addActivNumberDefault(workList)
            } else if (randomIndex === 1) {
                const workList = [2, 6, 11, 15, 18, 17, 16, 12, 7, 3, 0, 1, 5, 10, 14, 13, 8, 4, 9]
                addActivNumberDefault(workList)
            } else if (randomIndex === 2) {
                const workList = [11, 15, 18, 17, 16, 12, 7, 3, 0, 1, 2, 6, 10, 14, 13, 8, 4, 5, 9]
                addActivNumberDefault(workList)
            } else if (randomIndex === 3) {
                const workList = [18, 17, 16, 12, 7, 3, 0, 1, 2, 6, 11, 15, 14, 13, 8, 4, 5, 10, 9]
                addActivNumberDefault(workList)
            } else if (randomIndex === 4) {
                const workList = [16, 12, 7, 3, 0, 1, 2, 6, 11, 15, 18, 17, 13, 8, 4, 5, 10, 14, 9]
                addActivNumberDefault(workList)
            } else if (randomIndex === 5) {
                const workList = [7, 3, 0, 1, 2, 6, 11, 15, 18, 17, 16, 12, 8, 4, 5, 10, 14, 13, 9]
                addActivNumberDefault(workList)
            }
            return { startNumber: randomIndex, this: this }
        }

        //ここに完全にランダムに数字チップを置くバージョン（時計回りとか関係ないやつ）も実装できるといいかもね

    }

    addRandomResource() {
        const wood = new Wood()
        const brick = new Brick()
        const wool = new Wool()
        const grain = new Grain()
        const ore = new Ore()
        const desert = new Desert()
        const resourceList = [desert]

        for (let i = 0; i < 3; i++) {
            resourceList.push(wood, brick, wool, grain, ore)
        }
        resourceList.push(wood, wool, grain)

        for (let i = 18; i >= 0; i--) {
            // 0からiの範囲でランダムなインデックスを取得
            const randomIndex = Math.floor(Math.random() * (i + 1));

            this.tileList[i].resource = resourceList[randomIndex]
            resourceList.splice(randomIndex, 1)
        }
    }


}

function generateBoard() {
    const board = new Board([])
    const vertices = generateVertexList()
    const edges = generateEdgeList()
    board.addTile(vertices, edges, 0, [0, 1, 2, 8, 9, 10], [0, 1, 6, 7, 11, 12])
    board.addTile(vertices, edges, 1, [2, 3, 4, 10, 11, 12], [2, 3, 7, 8, 13, 14])
    board.addTile(vertices, edges, 2, [4, 5, 6, 12, 13, 14], [4, 5, 8, 9, 15, 16])
    board.addTile(vertices, edges, 3, [7, 8, 9, 17, 18, 19], [10, 11, 18, 19, 24, 25])
    board.addTile(vertices, edges, 4, [9, 10, 11, 19, 20, 21], [12, 13, 19, 20, 26, 27])
    board.addTile(vertices, edges, 5, [11, 12, 13, 21, 22, 23], [14, 15, 20, 21, 28, 29])
    board.addTile(vertices, edges, 6, [13, 14, 15, 23, 24, 25], [16, 17, 21, 22, 30, 31])
    board.addTile(vertices, edges, 7, [16, 17, 18, 27, 28, 29], [23, 24, 33, 34, 39, 40])
    board.addTile(vertices, edges, 8, [18, 19, 20, 29, 30, 31,], [25, 26, 34, 35, 41, 42])
    board.addTile(vertices, edges, 9, [20, 21, 22, 31, 32, 33], [27, 28, 35, 36, 43, 44])
    board.addTile(vertices, edges, 10, [22, 23, 24, 33, 34, 35], [29, 30, 36, 37, 45, 46])
    board.addTile(vertices, edges, 11, [24, 25, 26, 35, 36, 37], [31, 32, 37, 38, 47, 48])
    board.addTile(vertices, edges, 12, [28, 29, 30, 38, 39, 40], [40, 41, 49, 50, 54, 55])
    board.addTile(vertices, edges, 13, [30, 31, 32, 40, 41, 42], [42, 43, 50, 51, 56, 57])
    board.addTile(vertices, edges, 14, [32, 33, 34, 42, 43, 44], [44, 45, 51, 52, 58, 59])
    board.addTile(vertices, edges, 15, [34, 35, 36, 44, 45, 46], [46, 47, 52, 53, 60, 61])
    board.addTile(vertices, edges, 16, [39, 40, 41, 47, 48, 49], [55, 56, 62, 63, 66, 67])
    board.addTile(vertices, edges, 17, [41, 42, 43, 49, 50, 51], [57, 58, 63, 64, 68, 69])
    board.addTile(vertices, edges, 18, [43, 44, 45, 51, 52, 53], [59, 60, 64, 65, 70, 71])

    for (let i = 0; i < board.tileList.length; i++) {
        board.tileList[i].connectVertexEdge() //それぞれのタイルでエッジと頂点を結んでおく
    }

    board.vertices = vertices
    board.edges = edges

    board.vertices[2].tradingPost = '3to1'
    board.vertices[3].tradingPost = '3to1'
    board.vertices[5].tradingPost = '3to1'
    board.vertices[6].tradingPost = '3to1'
    board.vertices[15].tradingPost = 'brick'
    board.vertices[25].tradingPost = 'brick'
    board.vertices[36].tradingPost = 'wood'
    board.vertices[46].tradingPost = 'wood'
    board.vertices[52].tradingPost = '3to1'
    board.vertices[53].tradingPost = '3to1'
    board.vertices[49].tradingPost = 'grain'
    board.vertices[50].tradingPost = 'grain'
    board.vertices[38].tradingPost = 'ore'
    board.vertices[39].tradingPost = 'ore'
    board.vertices[16].tradingPost = '3to1'
    board.vertices[27].tradingPost = '3to1'
    board.vertices[7].tradingPost = 'wool'
    board.vertices[8].tradingPost = 'wool'


    return board
}


// // テスト
// const board = generateBoard()
// board.addRandomResource()
// console.log(board) 

// const testBoard = board.addActivNumberBoard('default')
// console.log('出目は', testBoard.startNumber, testBoard.board)



module.exports = { Board, generateBoard };
