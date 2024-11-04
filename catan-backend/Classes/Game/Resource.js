class Resource {
    distribute(playerList) {
        //　資源をプレイヤーに配布するそyいr
        playerList.Resource
    }
}

class Wood extends Resource {
}

class Brick extends Resource {
}

class Wool extends Resource {
}

class Grain extends Resource {
}

class Ore extends Resource {
}

class Desert extends Resource {
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