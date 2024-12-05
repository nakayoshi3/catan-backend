class Resource {
    distribute(playerList) {
        //　資源をプレイヤーに配布するそyいr
        playerList.Resource
    }
    
    serialize(){
    }
}

class Wood extends Resource {
    serialize(){
        return 'Wood'
    }
}

class Brick extends Resource {
    serialize(){
        return 'Brick'
    }
}

class Wool extends Resource {
    serialize(){
        return 'Wool'
    }
}

class Grain extends Resource {
    serialize(){
        return 'Grain'
    }
}

class Ore extends Resource {
    serialize(){
        return 'Ore'
    }
}

class Desert extends Resource {
    serialize(){
        return 'Desert'
    }
}

module.exports = {
    Resource,
    Wood,
    Brick,
    Wool,
    Grain,
    Ore,
    Desert
}