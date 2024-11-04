class Building {
    constructor(owner) {
        this.owner = owner
    }
}

class Town extends Building {
}

class Road extends Building {

}

class Settlement extends Town {

}

class City extends Town {
    
}

module.exports = Building;