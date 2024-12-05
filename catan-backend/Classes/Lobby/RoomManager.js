class RoomManager {
    constructor(roomList) {
        this.roomList = roomList
    }

    //部屋のリストにある名前の部屋が存在するか調べる
    search_room(search_name) {
        for (let i = 0; i < this.roomList.length; i++) {
            if (search_name === this.roomList[i].name) {
                return true
            }
        }
        return false
    }

    //部屋のリストの中からある部屋名の部屋を取得
    get_room(roomName) {
        for (let i = 0; i < this.roomList.length; i++) {
            if (roomName === this.roomList[i].name) {
                return this.roomList[i]
            }
        }
    }

    toString() {
        return roomList.map((room) => {
            room.toString
        })
    }
}

module.exports = RoomManager