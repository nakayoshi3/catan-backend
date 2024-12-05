class TradingPost {
    constructor(owner) {
        this.owner = owner
    }
}

class TwoOnePost extends TradingPost {
    constructor(owner, source) {
        super(owner)
        this.source = source 
    }
}

class ThreeOnePost extends TradingPost {
    constructor(owner) {
        super(owner)
    }
}