const GameRoom = require('./Classes/Lobby/GameRoom');
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
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

//////////////////////


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
function get_room(roomListArg, roomName){
  for (let i = 0; i < roomListArg.length; i++){
    if (roomName === roomListArg[i].name) {
      return roomListArg[i]
    }
  }
}

// room_name_listにたてられた部屋を保存
const roomList = []

io.on('connection', (socket) => {
  console.log('a user connected'); //バックエンドのコンソールに出力


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
      if (targetRoom.playerList.length >= 4){
        io.to(`${playerRoomInfo.room}`).emit('startGame', true)
        console.log('emmit startGame Event with a (多分値はいらない？)')
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

