var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

let clientsData = {}
let clientNames = []

io.on('connection', function (socket) {
  console.log("new Connectio request "+socket.id)
  socket.emit('server-requires-client-name', socket.id)
  socket.on('client-name', function (data) {
    socket.emit('client-name-ack', true);
    clientsData[socket.id] = { clientName: data.clientName };
    io.emit('lobby-players-list', clientsData)
  })
  socket.on('chat message', function (msg) {
    io.emit('chat message', msg);
  });
  socket.on('disconnect', function () {
    delete clientsData[socket.id]
    io.emit('lobby-players-list', clientsData)
  })
  // socket.on('send-invite',(data)=>{
  //   const socket = clientsData[data.socketId]
  // })
});

http.listen(port, function () {
  console.log('listening on *:' + port);
});
