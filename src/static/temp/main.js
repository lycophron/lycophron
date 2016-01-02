var $ = require('jquery');
require('jquery-ui/draggable');
require('jquery-ui/droppable');
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
  console.log(game);
  var dictionary = new L.Dictionary(game.language + '/' + game.dictionary + '.json');
  var board = new L.Board(game.type);
  var score = new L.Score(board, dictionary, game.scoring);
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
          tdE.append(createTilePlaceholder(x, y));
        }
      }

      function createTilePlaceholder(x, y) {
        var tileEl = $('<div>', {class: 'accept-tile-drop ui-droppable', 'data-x': x, 'data-y': y});
        tileEl.droppable({
          accept: function(el) {
            // TODO: do not accept if there is already one letter from the rack at the same position
            // return $(this).hasClass(TILE_CONSTANTS.acceptTileDropCSS);
            var hasTileFromRack = tilesOnRack.filter(function (tileEl) {
              return tileEl.attr('data-x') === x.toString() && tileEl.attr('data-y') === y.toString();
            });
            if (hasTileFromRack.length > 0) {
              return false;
            } else {
              return $(this).hasClass('accept-tile-drop');
            }
          },
          drop: function( event, ui ) {
            //console.log(ui);
            //ui.draggable.draggable.position(ui.draggable.draggable.originalPosition);

            // clear x y for letterElement
            //self.clearLetterElementPosition(ui.draggable);
            var draggedTile = $(ui.draggable[0]);
            tileEl.append(draggedTile);
            draggedTile.css({top: '0', left: '0'});
            draggedTile.attr('data-x', x);
            draggedTile.attr('data-y', y);
            checkMove(tilesOnRack);
            // console.log(tileEl);
            // var len = self._onDrop.length;
            // while (len--) {
            //     self._onDrop[len]();
            // }
          },
          hoverClass: 'hovered'
        });
        return tileEl;
      }

      gameEl.append(boardEl);

      // rack
      var rackEl = $('<div>', {class: 'rack tile-container accept-tile-drop ui-droppable'});
      var tilesOnRack = [];
      rackEl.droppable({
        accept: function(el) {
          // TODO: do not accept if there is already one letter from the rack at the same position
          // return $(this).hasClass(TILE_CONSTANTS.acceptTileDropCSS);
          return $(this).hasClass('accept-tile-drop');
        },
        drop: function( event, ui ) {
          // console.log(ui);
          //ui.draggable.draggable.position(ui.draggable.draggable.originalPosition);

          // clear x y for letterElement
          //self.clearLetterElementPosition(ui.draggable);
          var draggedTile = $(ui.draggable[0]);
          rackEl.append(draggedTile);
          draggedTile.css({top: '0', left: '0'});
          draggedTile.attr('data-x', -1);
          draggedTile.attr('data-y', -1);
          checkMove(tilesOnRack);
          // var len = self._onDrop.length;
          // while (len--) {
          //     self._onDrop[len]();
          // }
        },
        hoverClass: 'hovered'
      });
      gameEl.append(rackEl);

      function checkMove(tilesOnRack) {
        var tilesUsed = tilesOnRack.filter(function (tileEl) {
          return tileEl.attr('data-x') !== '-1' && tileEl.attr('data-y') !== '-1';
        });
        var move = tilesUsed.map(function (tileEl) {
          return {
            x: parseInt(tileEl.attr('data-x')),
            y: parseInt(tileEl.attr('data-y')),
            tile: {
              letter: tileEl.find('.letter').attr('data-value'),
              value: parseInt(tileEl.find('.value').attr('data-value'))
            }
          };
        });

        var result = score.getScore(move);

        // update solver result
        var resultEl = $('.solver-result');
        resultEl.children().remove();

        resultEl.append($('<div>', {html: result.message}));
        var shortDetailsEl = $('<div>', {class: result.success ? 'valid' : 'invalid'});
        shortDetailsEl.append($('<span>', {html: dictionary.decode(result.word)}));
        shortDetailsEl.append($('<span>', {html: result.score}));
        shortDetailsEl.append($('<span>', {html: result.isBingo ? 'BINGO' : ''}));
        resultEl.append(shortDetailsEl);

        var wordDetailsEl = $('<table>', {class: 'words'});
        var tbodyEl = $('<tbody>');
        wordDetailsEl.append(tbodyEl);
        var partialScore = 0;
        for (var i = 0; i < result.words.length; i += 1) {
          var rowEl = $('<tr>', {class: result.words.valid ? 'valid' : 'invalid'});
          rowEl.append($('<td>', {html: dictionary.decode(result.words[i].word)}));
          rowEl.append($('<td>', {html: result.words[i].score}));
          partialScore += result.words[i].score;
          tbodyEl.append(rowEl);
        }


        var rowEl = $('<tr>', {class: 'extra'});
        rowEl.append($('<td>', {html: ''}));
        rowEl.append($('<td>', {html: Math.max(result.score - partialScore, 0)}));
        tbodyEl.append(rowEl);

        var rowEl = $('<tr>', {class: 'sum' + result.words.valid ? 'valid' : 'invalid'});
        rowEl.append($('<td>', {html: dictionary.decode(result.word)}));
        rowEl.append($('<td>', {html: result.score}));
        tbodyEl.append(rowEl);

        resultEl.append(wordDetailsEl);

        // console.log(result);
      }

      var solverResultEl = $('<div>', {class: 'solver-result'});

      gameEl.append(solverResultEl);

      // controls
      var controlsEl = $('<div>', {class: 'controls'});
      for (var i = 0; i <= game.turns.length; i += 1) {
        controlsEl.append(turnDescription(i));
      }

      function turnDescription(id) {
        var turn = game.turns[id] || {word: '', score: '', isBingo: ''};
        var el = $('<div>', {class: 'turn-description'});
        el.append($('<span>', {html: id + 1}));
        var loadBtn = $('<button>', {html: 'Load'});
        loadBtn.on('click', function () {
          loadTurn(id);
        });
        el.append(loadBtn);
        el.append($('<span>', {html: dictionary.decode(turn.word)}));
        el.append($('<span>', {html: turn.score}));
        el.append($('<span>', {html: turn.isBingo ? 'Bingo' : ''}));
        return el;
      }

      gameEl.append(controlsEl);

      loadTurn(0);

      //
      function loadTurn(turnId_) {
        // clear tiles on Board
        board.clear();
        $('table.board').find('.tile').remove();
        $('table.board').find('.ui-droppable').addClass('accept-tile-drop');
        var turnId = Math.max(turnId_, 0);
        turnId = Math.min(turnId, game.turns.length);
        for (var i = 0; i < turnId; i += 1) {
          for (var j = 0; j < game.turns[i].move.length; j += 1) {
            var move = game.turns[i].move[j];
            board.setTile(move.x, move.y, new L.Tile(move.tile.letter, move.tile.value));
            // console.log('Add letter:', game.turns[i].move[j]);
            var placeEl = $('#game table tbody tr:nth-child(' + (move.y + 1) + ') ' + 'td:nth-child(' + (move.x + 1) + ') ');
            placeEl.append(newTile(move.tile));
            placeEl.find('.ui-droppable').removeClass('accept-tile-drop');
          }
        }

        var rackEl = $('div.rack');
        rackEl.find('.tile').remove();
        tilesOnRack = [];
        for (var i = 0; i < tilesOnRack.length; i += 1) {
          tilesOnRack[i].remove();
        }
        if (turnId < game.turns.length) {
          for (var j = 0; j < game.turns[turnId].rack.length; j += 1) {
            var tile = game.turns[turnId].rack[j];
            // console.log('Add letter:', game.turns[i].move[j]);
            var tileEl = newTile(tile, true);
            tileEl.attr('data-x', -1);
            tileEl.attr('data-y', -1);
            tilesOnRack.push(tileEl);
            rackEl.append(tileEl);
          }
        }
      }

      function newTile(tile, draggable) {
        var tileEl = $('<div>', {class: 'tile notranslate has-letter'});
        if (draggable) {
          tileEl.addClass('ui-draggable');
          tileEl.draggable({
            stack: 'div',
            revert: 'invalid'
          });
        }
        var decodedLetter = dictionary.decode(tile.letter);
        decodedLetter = decodedLetter === L.CONSTANTS.BLANK ? '' : decodedLetter;
        tileEl.append($('<div>', {class: 'letter', 'data-value': tile.letter, html: decodedLetter}));
        tileEl.append($('<div>', {class: 'value', 'data-value': tile.value, html: tile.value ? tile.value : ''}));
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
