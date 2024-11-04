class Player {
    constructor(name, resourceList, developmentList, restOfSettlement, restOfCity, restOfRoad, point) {
        this.name = name
        this.resourceList = resourceList
        this.developmentList = developmentList
        this.restOfSettlement = restOfSettlement
        this.restOfCity = restOfCity
        this.restOfRoad = restOfRoad
        this.point = point
    }
}

module.exports = Player;