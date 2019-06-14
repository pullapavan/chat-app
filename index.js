var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = 3001;



let clientsData = {}


io.on('connection', function (socket) {  
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
    const { rooms } = clientsData[socket.id];
    rooms.map((roomName,index)=>{
      io.to(roomName).emit('opponent-exit-room',{roomName})
    })
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
    
    let rooms = clientsData[socket.id].rooms;    
    let opponentRooms = clientsData[data.opponentSocketId].rooms    
    let roomName1 = `${clientsData[socket.id].clientName}_${clientsData[data.opponentSocketId].clientName}`
    let roomName2 = `${clientsData[data.opponentSocketId].clientName}_${clientsData[socket.id].clientName}`    
    if (!(rooms.includes(roomName1) || rooms.includes(roomName2) || opponentRooms.includes(roomName2) || opponentRooms.includes(roomName1))) {      
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
    if (true) {      
      io.to(data.roomName).emit('new-room-msg', { roomName:data.roomName,clientName:data.clientName,message:data.message});
    }
  });
});

http.listen(port, function () {
  console.log('listening on *:' + port);
});
