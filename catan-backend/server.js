const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
// const io = socketIo(server);

const io = socketIo(server, {
    cors: {
      origin: "http://localhost:3000", // フロントエンドのオリジンを許可
      methods: ["GET", "POST"],
      credentials: true
    }
  });
  
  // ExpressでCORS設定を追加
  app.use(cors({
    origin: "http://localhost:3000", // フロントエンドのオリジンを許可
    methods: ['POST', 'GET'],
    credentials: true
  }));
  

// app.use(cors({
//     'Access-Control-Allow-Origin': '*',
//     origin:"*",
//     methods: ['POST', 'GET'],
//     credentials: true
//   }));
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


io.on('connection', (socket) => {
    console.log('a user connected');

    // メッセージを受信したときの処理
    socket.on('chat message', (msg) => {
        
        // 自分にのみメッセージを送信
        socket.emit('chat message', msg); 
    });

    socket.on('CreateRoom', (inputValue) => {
        if (inputValue === 'a') {
            socket.emit('ExistRoom', true)
        }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// const PORT = 8080; //process.env.PORT ||
// server.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });
