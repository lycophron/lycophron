/*jshint node: true*/
/**
 * @author lattmann / https://github.com/lattmann
 */

function init(server, logger, config) {
    'use strict';
    var io = require('socket.io')(server),
        users = {},
        rooms = {},

        i,
        broadcastedMessages = [];

    logger.debug('Web sockets are initializing');

    // real-time communication

    io.use(function(socket, next) {
        // TODO: get user id from socket/session
        next();
    });

    var maxTurns = 15;
    var games = {};

    io.on('connection', function(socket) {
        logger.info('New websocket connected: ' + socket.id);

        socket.on('joinGame', function(msg) {
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
                webSocket.sockets.in(roomId).emit('newTurn', { id: msg.id, rack: [22, 33, 44, 55] });
            }
        });

        socket.on('turnSolution', function(msg) {
            logger.info('turnSolution submitted: ' + socket.id, msg);


        });


        socket.on('disconnect', function() {
            logger.info('Websocket disconnected: ' + socket.id);
        });

    });

    logger.debug('Web sockets are ready');
}

module.exports = {
    init: init
};