const GameRoom = require('./Lobby/GameRoom');
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


//部屋のリストにある部屋名の部屋が存在するか調べる
function search_room(room_list_arg, search_name) {
  for (let i = 0; i < room_list_arg.length; i++) {
    if (search_name === room_list_arg[i].name) {
      return true
    }
  }
  return false
}

function get_room(roomListArg, roomName){
  for (let i = 0; i < roomListArg.length; i++){
    if (roomName === roomListArg[i].name) {
      return roomListArg[i]
    }
  }
}

// room_name_listにたてられた部屋名を保存
const r1 = new GameRoom('test1', ['Ken'])
const r2 = new GameRoom('test2', ['Take'])
const roomList = [r1, r2]
io.on('connection', (socket) => {
  console.log('a user connected'); //バックエンドのコンソールに出力

  //名前を元に部屋が存在するか探索

  // socket.on('createRoom', (roomName) => {
  //   if (search_room(roomList, roomName)) {
  //     socket.emit('existRoom', true)
  //   } else {
  //     const new_room = new GameRoom(roomName, [])
  //     roomList.push(new_room)
  //   }
  // });

  // 一度にプレイヤー名とルーム名が送られてくる時の処理
  socket.on('createRoom', (playerRoomInfo) => {
    console.log('部屋', playerRoomInfo, 'が新たに作られました')
    if (search_room(roomList, playerRoomInfo.room)) {
      socket.emit('existRoom', true)
    } else {
      const new_room = new GameRoom(playerRoomInfo.room, [playerRoomInfo.player])
      roomList.push(new_room)
    }
    console.log('現在のルームリストはこちらです', roomList)
  });

  socket.on('joinRoom', (playerRoomInfo) => {
    if (search_room(roomList, playerRoomInfo.room)) {
      const targetRoom = get_room(roomList, playerRoomInfo.room)
      targetRoom.playerList.push(playerRoomInfo.player)
    } else {
      socket.emit('roomNotfound', roomName)
    }

  })



  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// const PORT = 8080; //process.env.PORT ||
// server.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });
