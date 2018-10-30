var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

const port = 3001;

var clients = {};

io.on('connection', function (socket) {
  //console.log('a user connected');

  socket.on('login', function (userName, callback) {
    console.log('new user logined as "' + userName + '"');

    clients[socket.id] = {
      name: userName,
      color: getRandomColor()
    };

    // запускаем callback 
    callback(userName);

    // посылаем сообщение о новом пользователе
    socket.broadcast.emit('new user', {
      user: clients[socket.id]
    });

    // посылаем обновленный объект с пользователями
    io.emit('users list', clients);

    // сообщение в чат
    socket.on('chat message', function (msg) {
      io.emit('message', {
        user: clients[socket.id],
        message: msg
      });
    });

    // выход из чата
    socket.on('disconnect', function () {
      console.log('user "' + clients[socket.id].name +'" disconected');
      socket.broadcast.emit('user left', {
        user: clients[socket.id]
      });
      delete clients[socket.id];
      
      // посылаем обновленный объект с пользователями
      io.emit('users list', clients);
    });

  });

  // выход без логина
  socket.on('disconnect', function () {
    //console.log('user disconected before login');
  });
});

// starting server
server.listen(port, () => console.log(`Listening on localhost:${port}`));


function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

