const GameRoom = require('./Classes/Lobby/GameRoom');
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const Board = require('./Classes/Game/Board');
const Tile = require('./Classes/Game/Tile');
const Vertex = require('./Classes/Game/Vertex');
const Edge = require('./Classes/Game/Edge');
const { Wood, Brick, Wool, Grain, Ore, Desert } = require('./Classes/Game/Resource');
const { Game } = require('./Classes/Game/Game');
const { emit } = require('process');
const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: "http://localhost:3000",
  methods: ['POST', 'GET'],
  credentials: true
}));

server.listen(8080, () => {
  console.log('Server is running on port 8080');
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // 特定のオリジンを許可する場合はURLを指定
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.get('/', (req, res) => {
  res.send('Welcome to the Socket.io Server!'); // シンプルなレスポンス
});


//部屋のリストにある名前の部屋が存在するか調べる
function search_room(room_list_arg, search_name) {
  for (let i = 0; i < room_list_arg.length; i++) {
    if (search_name === room_list_arg[i].name) {
      return true
    }
  }
  return false
}

//部屋のリストの中からある部屋名の部屋を取得
function get_room(roomListArg, roomName) {
  for (let i = 0; i < roomListArg.length; i++) {
    if (roomName === roomListArg[i].name) {
      return roomListArg[i]
    }
  }
}

function generateVertexList() {
  const vertexList = []
  for (let i = 0; i < 54; i++) {
    vertexList.push(new Vertex(i, null, null))
  }
  return vertexList
}

function generateEdgeList() {
  const edgeList = []
  for (let i = 0; i < 72; i++) {
    edgeList.push(new Edge(i, null))
  }
  return edgeList
}

function addTile(board, vertices, edges, id, vertexIDList, edgeIDList) {
  const tile = new Tile(id, [], [], null, null, null)
  for (let i = 0; i < 6; i++) {
    tile.vertexList.push(vertices[vertexIDList[i]])
    tile.edgeList.push(edges[edgeIDList[i]])
  }
  board.tileList.push(tile)
}

function generateBoard() {
  const board = new Board([])
  const vertices = generateVertexList()
  const edges = generateEdgeList()
  addTile(board, vertices, edges, 0, [0, 1, 2, 8, 9, 10], [0, 1, 6, 7, 11, 12])
  addTile(board, vertices, edges, 1, [2, 3, 4, 10, 11, 12], [2, 3, 7, 8, 13, 14])
  addTile(board, vertices, edges, 2, [4, 5, 6, 12, 13, 14], [4, 5, 8, 9, 15, 16])
  addTile(board, vertices, edges, 3, [7, 8, 9, 17, 18, 19], [10, 11, 18, 19, 24, 25])
  addTile(board, vertices, edges, 4, [9, 10, 11, 19, 20, 21], [12, 13, 19, 20, 26, 27])
  addTile(board, vertices, edges, 5, [11, 12, 13, 21, 22, 23], [14, 15, 20, 21, 28, 29])
  addTile(board, vertices, edges, 6, [13, 14, 15, 23, 24, 25], [16, 17, 21, 22, 30, 31])
  addTile(board, vertices, edges, 7, [16, 17, 18, 27, 28, 29], [23, 24, 33, 34, 39, 40])
  addTile(board, vertices, edges, 8, [18, 19, 20, 29, 30, 31,], [25, 26, 34, 35, 41, 42])
  addTile(board, vertices, edges, 9, [20, 21, 22, 31, 32, 33], [27, 28, 35, 36, 43, 44])
  addTile(board, vertices, edges, 10, [22, 23, 24, 33, 34, 35], [29, 30, 36, 37, 45, 46])
  addTile(board, vertices, edges, 11, [24, 25, 26, 35, 36, 37], [31, 32, 37, 38, 47, 48])
  addTile(board, vertices, edges, 12, [28, 29, 30, 38, 39, 40], [40, 41, 49, 50, 54, 55])
  addTile(board, vertices, edges, 13, [30, 31, 32, 40, 41, 42], [42, 43, 50, 51, 56, 57])
  addTile(board, vertices, edges, 14, [32, 33, 34, 42, 43, 44], [44, 45, 51, 52, 58, 59])
  addTile(board, vertices, edges, 15, [34, 35, 36, 44, 45, 46], [46, 47, 52, 53, 60, 61])
  addTile(board, vertices, edges, 16, [39, 40, 41, 47, 48, 49], [55, 56, 62, 63, 66, 67])
  addTile(board, vertices, edges, 17, [41, 42, 43, 49, 50, 51], [57, 58, 63, 64, 68, 69])
  addTile(board, vertices, edges, 18, [43, 44, 45, 51, 52, 53], [59, 60, 64, 65, 70, 71])
  return board
}


//テスト用 ちゃんとランダムに資源が割り当てられたBoardインスタンスが返ってくるよ
const board = addRandomResource(generateBoard())
console.log(board) 
/////////

function addRandomResource(board) {
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

    board.tileList[i].resource = resourceList[randomIndex]
    resourceList.splice(randomIndex, 1)
  }
  return board
}


function addActivNumber(number, tile) {
  tile.activeNumber = number
}

function addActivNumberBoard(config, board) {

  //workListに応じて実際に数字をBoardのそれぞれのタイルに割り当てていくサブ関数
  function addActivNumberDefault(board, workList) {
    const numberList = [5,2,6,3,8,10,9,12,11,4,8,10,9,4,5,6,3,11] //a,b,c,...に対応してる

    for (let i=0, j=0; i < workList.length; i++) {
      if (!(board.tileList[workList[i]].resource instanceof Desert)) {
        board.tileList[workList[i]].activeNumber = numberList[j]
        console.log(board.tileList[workList[i]].id, 'に', numberList[j],'が割り当てられました')
        j++
      } else {
        console.log(board.tileList[workList[i]].id, 'のResourceはDesertでした')
      }
    }
  }

  //いつもやってるかたんの数字チップの配置の仕方
  //適当にサイコロを振って出た数1~6(0~5)に応じてスタート位置を変えてそのタイルから時計回りに数字チップを置いていく
  if (config === 'default') {
    const randomIndex = Math.floor(Math.random() * 6)
    if (randomIndex === 0) { 
      const workList = [0,1,2,6,11,15,18,17,16,12,7,3,4,5,10,14,13,8,9]
      addActivNumberDefault(board, workList)
    } else if (randomIndex === 1) {
      const workList = [2,6,11,15,18,17,16,12,7,3,0,1,5,10,14,13,8,4,9]
      addActivNumberDefault(board, workList)
    } else if (randomIndex === 2) {
      const workList = [11,15,18,17,16,12,7,3,0,1,2,6,10,14,13,8,4,5,9]
      addActivNumberDefault(board, workList)
    } else if (randomIndex === 3) {
      const workList = [18,17,16,12,7,3,0,1,2,6,11,15,14,13,8,4,5,10,9]
      addActivNumberDefault(board, workList)
    } else if (randomIndex === 4) {
      const workList = [16,12,7,3,0,1,2,6,11,15,18,17,13,8,4,5,10,14,9]
      addActivNumberDefault(board, workList)
    } else if (randomIndex === 5) {
      const workList = [7,3,0,1,2,6,11,15,18,17,16,12,8,4,5,10,14,13,9]
      addActivNumberDefault(board, workList)
    }
    return {startNumber: randomIndex, board: board}
  }

  //ここに完全にランダムに数字チップを置くバージョン（時計回りとか関係ないやつ）も実装できるといいかもね

}
const testBoard = addActivNumberBoard('default', board)
console.log('出目は', testBoard.startNumber, testBoard.board)


const roomList = []

io.on('connection', (socket) => {
  console.log('a user connected');


  // 一度にプレイヤー名とルーム名が送られてくる時の処理
  socket.on('createRoom', (playerRoomInfo) => {
    if (search_room(roomList, playerRoomInfo.room)) {
      socket.emit('existRoom', true)
      console.log('existRoomイベントを送信しました')
    } else {
      const new_room = new GameRoom(playerRoomInfo.room, [playerRoomInfo.player])
      roomList.push(new_room)
      socket.join(`${playerRoomInfo.room}`);
      socket.emit('existRoom', false)
      console.log('部屋', playerRoomInfo, 'が新たに作られました')
    }
    console.log('現在のルームリストはこちらです', roomList, '\n')
  });


  socket.on('joinRoom', (playerRoomInfo) => {
    console.log('joinRoomイベントを受け取りました')
    if (search_room(roomList, playerRoomInfo.room)) {
      const targetRoom = get_room(roomList, playerRoomInfo.room)
      if (targetRoom.playerList.length <= 3) {
        targetRoom.playerList.push(playerRoomInfo.player)
        socket.join(`${playerRoomInfo.room}`);
        socket.emit('roomFound', true)
        console.log('emit roomFound Event with a value true')
      } else {
        socket.emit('roomMaxim')
        console.log('emit roomMaxim Event')
      }
      if (targetRoom.playerList.length >= 4) {
        const board = addActivNumberBoard('default', addRandomResource(generateBoard())).board
        console.log(board)
        
        const emitedValue = []
        for (let i=0; i<board.tileList.length; i++) {
          emitedValue.push({id: board.tileList[i].id, resource: board.tileList[i].resource, activeNumber: board.tileList[i].activeNumber})
        }
        
        io.to(`${playerRoomInfo.room}`).emit('startGame', emitedValue)
        console.log('emmit startGame Event with タイル番号と資源、アクティブナンバーの対応のリスト')
      }
    } else {
      socket.emit('roomFound', false)
      console.log('emit roomFound Event with a value false')
    }
    console.log('現在のルームリストはこちらです', roomList, '\n') // デバッグ用だから消さないでねー
  });



  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

