'use strict';

var PORT = 3000;

var compression = require('compression');
var express = require('express');
var app = express();
// compress responses
app.use(compression());
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


var http = require('http');
var server = http.createServer(app);

var glob = require('glob');
var path = require('path');
var fs = require('fs');
var winston = require('winston');

var logger = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({
                colorize: true,
                timestamp: true,
                prettyPrint: true
            }),
            new (winston.transports.File)({
                filename: 'server.log',
                json: false
            })
        ]
    });

// api
var apiRouter = express.Router();

apiRouter.get('/games', function (req, res) {
  // res.send({message: 'TODO'});
  glob('upload/games/[a-f0-9]*.json', /*options,*/ function (er, files) {
    // files is an array of filenames.
    // If the `nonull` option is set, and nothing
    // was found, then files is ["**/*.js"]
    // er is an error object or null.
    files = files.filter(function (f) { return path.basename(f).length === '6fb93000c7ccd077be42c091dfdb00ce9fd345bc.json'.length; });
    files = files.map(function (f) { return path.basename(f, path.extname(f)); });
    res.send(files);
  })
});

apiRouter.get('/games/:id([a-f0-9]{40})', function (req, res) {
  // res.send({message: req.params.id + '.json'});

  res.send(JSON.parse(fs.readFileSync('upload/games/' + req.params.id + '.json')));
});

apiRouter.post('/games/:id([a-f0-9]{40})', function (req, res) {
  try {
    // TODO: validate body
    fs.writeFileSync('upload/games/' + req.params.id + '.json', JSON.stringify(req.body));
    res.sendStatus(201);
  } catch (err) {
    next(err);
  }
});

apiRouter.post('/bugs/', function (req, res) {
  try {
    // TODO: validate body
    var bugReportFileName = 'bugs/' + (new Date()).toISOString() + '.json';
    logger.info('Bug report was received:', bugReportFileName);
    fs.writeFileSync(bugReportFileName, JSON.stringify(req.body));
    res.sendStatus(201);
  } catch (err) {
    next(err);
  }
});

apiRouter.get('/tournaments', function (req, res) {
  res.send({message: 'TODO'});
});

apiRouter.get('/users', function (req, res) {
  res.send({message: 'TODO'});
});

apiRouter.get('/groups', function (req, res) {
  res.send({message: 'TODO'});
});

apiRouter.get('/tools', function (req, res) {
  res.send({message: 'TODO'});
});


app.use('/api', apiRouter);

// real-time communication
var io = require('socket.io');
var webSocket = io.listen(server);

webSocket.use(function (socket, next) {
  // TODO: get user id from socket/session
  next();
});

var maxTurns = 15;
var games = {};

webSocket.on('connection', function(socket) {
  logger.info('New websocket connected: ' + socket.id);

  socket.on('joinGame', function (msg) {
    logger.info('joinGame request from: ' + socket.id, msg);
    var roomId = 'game/' + msg.id;
    var game;
    if (games.hasOwnProperty(msg.id) === false) {
      games[msg.id] = {
        roomId: roomId,
        turn: 0,
        status: 'WAITING',
        solutions: []
      }
    }

    game = games[msg.id];

    socket.join(roomId);
    // socket.broadcast.to(room).emit('joined', 'message');
    // console.log(webSocket.sockets.in(roomId));

    if (Object.keys(webSocket.sockets.adapter.rooms[roomId]).length > 1) {
      webSocket.sockets.in(roomId).emit('newTurn', {id: msg.id, rack: [22, 33, 44, 55]});
    }
  });

  socket.on('turnSolution', function (msg) {
    logger.info('turnSolution submitted: ' + socket.id, msg);


  });


  socket.on('disconnect', function () {
    logger.info('Websocket disconnected: ' + socket.id);
  });

});


// static contents
var path = require('path');
app.use(express.static(path.join(__dirname, '..', 'dist')));

// app.use(function (req, res) {
//     return res.redirect(req.protocol + '://' + req.get('Host') + '/#' + req.url);
// });

server.listen(PORT, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
