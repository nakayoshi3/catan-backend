const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { Board, generateBoard } = require('./Classes/Game/Board');
const GameManager = require('./Classes/Game/GameManager');
const { emit } = require('process');
const app = express();
const server = http.createServer(app);
const createRoom = require('./Event/createRoom');
const joinRoom = require('./Event/joinRoom');
const startGame = require('./Event/startGame');

const io = socketIo(server, {
  cors: {
    origin:   "https://katan-project-ef08acf343f3.herokuapp.com", // HerokuのURLを環境変数で管理
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://katan-project-ef08acf343f3.herokuapp.com"); // こちらも環境変数で管理 process.env.FRONTEND_URL || "http://localhost:3000" ||
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const PORT = process.env.PORT || "https://katan-project-ef08acf343f3.herokuapp.com"; // Herokuのポート番号を使い、ローカルでは8080を使う

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // 特定のオリジンを許可する場合はURLを指定
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => {
  res.send('Welcome to the Socket.io Server!'); // シンプルなレスポンス
});

const gameManager = new GameManager([])

io.on('connection', (socket) => {
  console.log(`a user connected: id= ${socket.id}`);

  createRoom(socket, gameManager);

  joinRoom(io, socket, gameManager);

  startGame(io, socket, gameManager);

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

