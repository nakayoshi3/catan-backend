class Development {
    constructor() {
        this.isOpen = false
    }

    use() {
        //各発展カードが使われたときに絶対怒るような処理を書く
        this.isOpen = true
    }
}

class DKnignt extends Development{

    //全然エラー吐くけどお気持ちこんな感じか？
    use(tile, player) {
        super.use()
        tile.knignt = new Knignt(player)
    }
}

class DPoint extends Development {

}

class DDraw extends Development {

}

class DBuildRoad extends Development {

}

class DMonopoly extends Development {

}

