const { DKnight, DPoint } = require("./Development")
const { Wood, Brick, Wool, Grain, Ore } = require("./Resource")

class Player {
    constructor(name, socket) {
        this.name = name
        this.socket = socket
        this.color = null
        this.resourceList = { wood: 0, brick: 0, wool: 0, grain: 0, ore: 0 }
        this.developmentList = []
        // this.hiddenDevelopmentList = {knight: 0,point: 0, buildRoad: 0, drawCard: 0, monopoly: 0 }
        // this.openDevelopmentList = {knight: 0,point: 0, buildRoad: 0, drawCard: 0, monopoly: 0 }
        this.restOfSettlement = 5
        this.restOfCity = 5
        this.restOfRoad = 15
        this.maxKnight = false
        this.point = 0
    }

    getDevelopment(id) {
        //idと一致する発展カードを返す
        for (let i = 0; i < this.developmentList.length; i++) {
            if (this.developmentList[i].id === id) {
                return this.developmentList[i]
            }
        }
    }

    getNumberOfResources() {
        return this.resourceList.wood + this.resourceList.brick + this.resourceList.wool + this.resourceList.grain + this.resourceList.ore
    }

    enableUseDevelopment() {
        //ターン終了時に呼び出される
        //すでにオープンになっていない、かつポイントカードでないものを全てcanUse=trueにする
        for (let i = 0; i < this.developmentList.length; i++) {
            console.log(this.developmentList[i], this.developmentList[i].isOpen, this.developmentList[i] instanceof DPoint)
            if ((!(this.developmentList[i].isOpen)) && (!(this.developmentList[i] instanceof DPoint))) {
                console.log(this.developmentList[i].canUse)
                this.developmentList[i].canUse = true
            }
        }
    }

    getOpenKnight() {
        //公開されている騎士カードの数を返す
        let result = 0
        for (let i = 0; i < this.developmentList.length; i++) {
            if (this.developmentList[i].isOpen && this.developmentList[i] instanceof DKnight) {
                result += 1
            }
        }
        return result;
    }

    getRandomResource() {
        function createResourceList(props) {
            const result = []
            for (let i = 0; i < props.wood; i++) {
                result.push('wood')
            }
            for (let i = 0; i < props.brick; i++) {
                result.push('brick')
            }
            for (let i = 0; i < props.wool; i++) {
                result.push('wool')
            }
            for (let i = 0; i < props.grain; i++) {
                result.push('grain')
            }
            for (let i = 0; i < props.ore; i++) {
                result.push('ore')
            }
            return result
        }

        if ((this.resourceList.wood === 0) && (this.resourceList.brick === 0) && (this.resourceList.wool === 0) && (this.resourceList.grain === 0) && (this.resourceList.ore === 0)) { //何も資源を持っていない場合
            console.log('何も持ってません')
            return 'empty'
        } else {
            const resources = createResourceList(this.resourceList)
            console.log('変換しました', resources)
            const randomIndex = Math.floor(Math.random() * (resources.length)); //resourcesのランダムなインデックスを取得
            const result = resources[randomIndex]
            console.log(result, 'が引かれました')
            if (result === 'wood') {
                this.resourceList.wood -= 1
            } else if (result === 'brick') {
                this.resourceList.brick -= 1
            } else if (result === 'wool') {
                this.resourceList.wool -= 1
            } else if (result === 'grain') {
                this.resourceList.grain -= 1
            } else { //oreの場合
                this.resourceList.ore -= 1
            }
            return result
        }
    }

    hasResources(props) {
        return ((this.resourceList.wood >= props.wood) && (this.resourceList.brick >= props.brick) && (this.resourceList.wool >= props.wool) && (this.resourceList.grain >= props.grain) && (this.resourceList.ore >= props.ore))
    }

    addResourcePlayer(props) {
        //propsの内容だけプレイヤーの手札に資源を追加する
        this.resourceList.wood += props.wood
        this.resourceList.brick += props.brick
        this.resourceList.wool += props.wool
        this.resourceList.grain += props.grain
        this.resourceList.ore += props.ore
    }

    reduceResourcePlayer(props) {
        //propsの内容だけプレイヤーの手札から資源を引く
        this.resourceList.wood -= props.wood
        this.resourceList.brick -= props.brick
        this.resourceList.wool -= props.wool
        this.resourceList.grain -= props.grain
        this.resourceList.ore -= props.ore
    }

    useKnight() {

        this.socket.emit('knight')
    }

    addResource(resource, number) {
        if (resource instanceof Wood) {
            this.resourceList.wood += number
        } else if (resource instanceof Brick) {
            this.resourceList.brick += number
        } else if (resource instanceof Wool) {
            this.resourceList.wool += number
        } else if (resource instanceof Grain) {
            this.resourceList.grain += number
        } else if (resource instanceof Ore) {
            this.resourceList.ore += number
        } else { }
    }

    props() {
        return { name: this.name, color: this.color, resourceList: this.resourceList, developmentList: this.developmentList.map(development => development.props()), restOfSettlement: this.restOfSettlement, restOfCity: this.restOfCity, restOfRoad: this.restOfRoad, maxKnight: this.maxKnight, point: this.point } //hiddenDevelopmentList: this.hiddenDevelopmentList, openDevelopmentList:this.openDevelopmentList
    }
}

module.exports = Player;