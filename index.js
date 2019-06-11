var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = 3001;

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

let clientsData = {}
let clientNames = []

io.on('connection', function (socket) {
  console.log("new Connectio request " + socket.id)
  socket.emit('server-requires-client-name', socket.id)
  socket.on('client-name', function (data) {
    socket.emit('client-name-ack', true);
    clientsData[socket.id] = { clientName: data.clientName, rooms: [] };
    io.emit('lobby-players-list', clientsData)
  })
  socket.on('chat message', function (msg) {
    io.emit('chat message', msg);
  });
  socket.on('disconnect', function () {
    delete clientsData[socket.id]
    io.emit('lobby-players-list', clientsData)
  });
  socket.on('send-invite', function (destination) {    
    socket.broadcast.to(destination.opponentSocketId).emit('new-invite', { socketId: socket.id });
  });
  socket.on('error-ack', function (data) {
    socket.broadcast.to(data.opponentSocketId).emit('error-ack', data.msg);
  });
  //Upon Clicking Accept
  socket.on('Accept', function (data) {
    console.log(`received data in case of Accepting Request ${data.opponentSocketId}`)
    let rooms = clientsData[socket.id].rooms;
    console.log(`${rooms.length} before joining new room`);
    let roomName1 = `${clientsData[socket.id].clientName}_${clientsData[data.opponentSocketId].clientName}`
    let roomName2 = `${clientsData[data.opponentSocketId].clientName}_${clientsData[socket.id].clientName}`
    console.log(!rooms.length || !(rooms.include(roomName1) || rooms.include(roomName2))+" join Room Condition")
    if (!rooms.length || !(rooms.include(roomName1) || rooms.include(roomName2))) {
      console.log(`Inside Join Room ${roomName1}`)
      socket.join(roomName1)      
      //sending ACk to player that his request has been accepted.
      socket.broadcast.to(data.opponentSocketId).emit('player-accepted-room', { opponentSocketId: data.opponentSocketId,roomName:roomName1 });
    }
  });
  //This shouls be sent bt player after his opponent accepted his request
  socket.on('join-opponent-accepted-room',(data)=>{
    socket.join(data.roomName)
    //This means both the players joined room to emit a room Message
    io.to(data.roomName).emit('new-room',{
    roomName:data.roomName 
    });
  });  
  socket.on('room-message', (data) => {
    console.log("Inside New Message")
    if (true) {
      console.log("Emmitting room message to all clients in the room")
      io.to(data.roomName).emit('new-room-msg', { roomName:data.roomName,clientName:data.clientName,message:data.message});
    }
  });

});

http.listen(port, function () {
  console.log('listening on *:' + port);
});
