var $ = require('jquery');
var request = require('superagent');

var L = require('../../../lib/lycophron');

console.log(L);

window.runTest2 = function () {
  var gameGenerator = new L.GameGenerator();

  gameGenerator.on('progress', function (value) {
    console.log(value + '%');
  });


  // var generatedGameDeferred = gameGenerator.generateGame('en', 'standard', 'WL2014', 'SQUARE');
  var generatedGameDeferred = gameGenerator.generateGame('hu', 'standard', 'me2003', 'SQUARE');

  generatedGameDeferred
    .then(function (generatedGame) {
      console.log(generatedGame);
      loadGame(generatedGame);
    });
};

window.runTest = function () {
  var Tile = L.Tile;
  var dictionary = new L.Dictionary('en' + '/' + 'WL2014' + '.json');
  var board = new L.Board();
  var score = new L.Score(board, dictionary);
  var rack = new L.Rack();
  var solver = new L.Solver(board, score, dictionary);
  // setup board
  board.setTile(14, 0, new Tile('a', 4));
  board.setTile(14, 1, new Tile('b', 4));
  board.setTile(14, 2, new Tile('c', 4));
  board.setTile(14, 3, new Tile('d', 4));
  board.setTile(14, 4, new Tile('e', 4));
  board.setTile(14, 5, new Tile('f', 4));
  board.setTile(14, 6, new Tile('g', 8));
  board.setTile(14, 8, new Tile('x', 8));
  board.setTile(14, 9, new Tile('c', 4));
  board.setTile(14, 10, new Tile('h', 4));
  board.setTile(14, 11, new Tile('i', 4));
  board.setTile(14, 12, new Tile('j', 4));
  board.setTile(14, 13, new Tile('k', 4));
  board.setTile(14, 14, new Tile('l', 4));

  board.setTile(13, 7, new Tile('c', 8));
  board.setTile(0, 6, new Tile('x', 8));
  board.setTile(0, 8, new Tile('x', 8));

  board.setTile(5, 7, new Tile('z', 10));
  board.setTile(7, 7, new Tile('p', 4));
  // set rack
  rack.addTile(new Tile('s', 1));
  rack.addTile(new Tile('a', 1));
  rack.addTile(new Tile('e', 1));
  rack.addTile(new Tile('e', 1));
  rack.addTile(new Tile('e', 1));
  rack.addTile(new Tile('?', 0));

  dictionary.ready()
    .then(function () {
      var solutions = solver.solve(rack);
      console.log(solutions);
      console.error('done');
    })
    .catch(console.error);
};

window.runTest3 = function () {
  var Tile = L.Tile;
  var dictionary = new L.Dictionary('en' + '/' + 'WL2014' + '.json');
  var board = new L.Board();
  var score = new L.Score(board, dictionary);
  var rack = new L.Rack();
  var solver = new L.Solver(board, score, dictionary);

  board.setTile(3, 7, new Tile('q', 10));
  board.setTile(4, 6, new Tile('j', 8));
  board.setTile(4, 7, new Tile('u', 1));
  board.setTile(4, 8, new Tile('r', 1));
  board.setTile(4, 9, new Tile('a', 1));
  board.setTile(4, 10, new Tile('t', 1));
  board.setTile(4, 11, new Tile('s', 1));
  board.setTile(5, 7, new Tile('e', 1));
  board.setTile(5, 9, new Tile('w', 4));
  board.setTile(5, 10, new Tile('o', 1));
  board.setTile(5, 11, new Tile('o', 1));
  board.setTile(5, 12, new Tile('i', 0));
  board.setTile(5, 13, new Tile('n', 1));
  board.setTile(5, 14, new Tile('g', 2));
  board.setTile(6, 7, new Tile('e', 1));
  board.setTile(7, 7, new Tile('r', 1));
  // set rack
  rack.addTile(new Tile('c', 3));
  rack.addTile(new Tile('h', 4));
  rack.addTile(new Tile('e', 1));
  rack.addTile(new Tile('i', 1));
  rack.addTile(new Tile('o', 1));
  rack.addTile(new Tile('e', 1));
  rack.addTile(new Tile('a', 1));

  dictionary.ready()
    .then(function () {
      var solutions = solver.solve(rack);
      console.log(solutions);
      console.error('done');
    })
    .catch(console.error);
};

$('button').click(function () {
  runTest2();
});

function loadGame(game) {
  var dictionary = new L.Dictionary(game.language + '/' + game.dictionary + '.json');
  var board = new L.Board(game.type);
  var score = new L.Score(board, dictionary);
  var rack = new L.Rack();
  var solver = new L.Solver(board, score, dictionary);
  var bag = new L.Bag(game.language, game.type, dictionary);

  bag.ready()
    .then(function () {

      var gameEl = $('#game');
      gameEl.children().remove();

      // game information
      var infoEl = $('<div>', {class: 'info'});
      infoEl.append($('<span>', {html: game.language}));
      infoEl.append($('<span>', {html: game.dictionary}));
      infoEl.append($('<span>', {html: 'Max score: ' + game.maxScore}));
      infoEl.append($('<span>', {html: 'Sum score: ' + game.sumScore}));
      infoEl.append($('<span>', {html: 'Avg score: ' + Math.floor(game.sumScore / game.turns.length * 100) / 100}));
      infoEl.append($('<span>', {html: 'Bingos: ' + game.numBingos}));
      infoEl.append($('<span>', {html: 'Scoring: ' + game.scoring}));

      gameEl.append(infoEl);

      // board
      var boardEl = $('<table>', {class: 'board'});
      var tbodyEl = $('<tbody>');
      boardEl.append(tbodyEl);
      var boardSize = board.getSize();
      var x;
      var y;

      for (y = 0; y < boardSize.y; y += 1) {
        var rowEl = $('<tr>');
        tbodyEl.append(rowEl);
        for (x = 0; x < boardSize.x; x += 1) {
          var tdE = $('<td>', {class: 'part'});
          rowEl.append(tdE);
          var modifier = board.getModifier(x, y);
          if (modifier.multiplier > 1) {
            tdE.addClass(modifier.type + '-' + modifier.multiplier);
          }
          var tileEl = $('<div>', {class: 'accept-tile-drop ui-droppable'});
          tdE.append(tileEl);
        }
      }

      gameEl.append(boardEl);

      // rack
      var rackEl = $('<div>', {class: 'rack'});

      gameEl.append(rackEl);

      // controls
      var controlsEl = $('<div>', {class: 'controls'});
      for (var i = 0; i < game.turns.length; i += 1) {
        controlsEl.append(turnDescription(i));
      }

      function turnDescription(id) {
        var turn = game.turns[id];
        var el = $('<div>', {class: 'turn-description'});
        el.append($('<span>', {html: id + 1}));
        var loadBtn = $('<button>', {html: 'Load'});
        loadBtn.on('click', function () {
          loadTurn(id + 1);
        });
        el.append(loadBtn);
        el.append($('<span>', {html: dictionary.decode(turn.word)}));
        el.append($('<span>', {html: turn.score}));
        el.append($('<span>', {html: turn.isBingo ? 'Bingo' : ''}));
        return el;
      }

      gameEl.append(controlsEl);

      loadTurn(1);

      //
      function loadTurn(turnId_) {
        // clear tiles on Board
        $('table.board').find('.tile').remove();

        var turnId = Math.max(turnId_, 1);
        turnId = Math.min(turnId, game.turns.length);
        for (var i = 0; i < turnId; i += 1) {
          for (var j = 0; j < game.turns[i].move.length; j += 1) {
            var move = game.turns[i].move[j];
            // console.log('Add letter:', game.turns[i].move[j]);
            var placeEl = $('#game table tbody tr:nth-child(' + (move.y + 1) + ') ' + 'td:nth-child(' + (move.x + 1) + ') ');
            placeEl.append(newTile(move.tile));
          }
        }
      }

      function newTile(tile) {
        var tileEl = $('<div>', {class: 'tile notranslate has-letter'});
        tileEl.append($('<div>', {class: 'letter', html: dictionary.decode(tile.letter)}));
        tileEl.append($('<div>', {class: 'value', html: tile.value ? tile.value : ''}));
        return tileEl;
      }

    })
    .catch(function (err) {
      console.error(err);
      throw err;
    });
}

request
  .get('/api/games/')
  .end(function (err, res) {
    console.log(err);
    // console.log(res);
    var gameIds = res.body;

    var games = {};

    $('select').on('change', function () {
      loadGame(games[$('select').val()]);
    });

    for (var i = 0; i < gameIds.length; i += 1) {
      request
        .get('/api/games/' + gameIds[i])
        .end(function (err, res) {
          var game = res.body;
          games[game.id] = game;
          $('select').append($('<option>', {value: game.id, html: game.id.substring(0, 6) + ' ' + game.language + ' ' + game.sumScore + ' ' + game.numBingos + ' ' + game.maxScore}));
          if (Object.keys(games).length === 1) {
            $('select').val(game.id).change();
          }
        });
    }


  });
