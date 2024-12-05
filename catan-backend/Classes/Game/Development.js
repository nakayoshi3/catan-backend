class Development {
    constructor(id) {
        this.id = id
        this.isOpen = false
        this.canUse = false
    }

    // use() {
    //     //各発展カードが使われたときに絶対怒るような処理を書く
    //     this.isOpen = true
    // }
}

class DKnight extends Development{
    props() {
        return {id: this.id, name: 'knight', isOpen: this.isOpen, canUse: this.canUse}
    }
}

class DPoint extends Development {
    props() {
        return {id: this.id, name: 'point', id: this.id, isOpen: this.isOpen, canUse: this.canUse}
    }
}

class DDrawCard extends Development {
    props() {
        return {id: this.id, name: 'drawCard', isOpen: this.isOpen, canUse: this.canUse}
    }
}

class DBuildRoad extends Development {
    props() {
        return {id: this.id, name: 'buildRoad', isOpen: this.isOpen, canUse: this.canUse}
    }
}

class DMonopoly extends Development {
    props() {
        return {id: this.id, name: 'monopoly', isOpen: this.isOpen, canUse: this.canUse}
    }
}

module.exports = {Development, DKnight, DPoint, DDrawCard, DBuildRoad, DMonopoly}
