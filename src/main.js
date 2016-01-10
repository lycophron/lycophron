////////////////////////////////////////////////////////////////////////////////
//
// FIXME: WARNING
//
// TODO: THIS IS A TEMPORARY IMPLEMENTATION, MUST BE COMPLETELY REWRITTEN
//
////////////////////////////////////////////////////////////////////////////////


var $ = require('jquery');
require('jquery-ui/draggable');
require('jquery-ui/droppable');
var request = require('superagent');
var URI = require('urijs');

var L = require('../lib/lycophron');
L.version = require('../version.json');

console.log(L);

var url = new URI(window.location.href);
var query = url.query(true);

console.log(query);


window.runTest2 = function () {
  var gameGenerator = new L.GameGenerator();

  gameGenerator.on('progress', function (value) {
    console.log(value + '%');
  });


  // var generatedGameDeferred = gameGenerator.generateGame('en', 'standard', 'WL2014', 'SQUARE');
  var generatedGameDeferred = gameGenerator.generateGame('hu', 'standard', 'me2003', 'SQUARE');

  return generatedGameDeferred
    .then(function (generatedGame) {
      console.log(generatedGame);
      return generatedGame;
    });
};

window.runTest = function () {
  var Tile = L.Tile;
  var dictionary = new L.Dictionary('hu' + '/' + 'me2003' + '.json');
  var board = new L.Board();
  var score = new L.Score(board, dictionary);
  var rack = new L.Rack();
  var solver = new L.Solver(board, score, dictionary);

  // setup board
  board.setTile(4, 7, new Tile('b', 2));
  board.setTile(5, 7, new Tile('E', 3));
  board.setTile(6, 7, new Tile('k', 1));
  board.setTile(7, 7, new Tile('a', 1));
  board.setTile(4, 8, new Tile('Q', 4));
  board.setTile(4, 9, new Tile('j', 4));
  board.setTile(4, 10, new Tile('t', 1));

  // set rack
  rack.addTile(new Tile('X', 4));
  rack.addTile(new Tile('h', 3));

  return dictionary.ready()
    .then(function () {
      console.log('here');
      solver.getSolution(['?', 'E'], null, ['X', 'h']);

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

  return dictionary.ready()
    .then(function () {
      var solutions = solver.solve(rack);
      console.log(solutions);
      console.error('done');
    })
    .catch(console.error);
};

$('#test').click(function () {
  runTest()
    .then(function (generatedGame) {
      if (generatedGame) {
        loadGame(generatedGame);
      }
    });
});

$('#generate').click(function () {
  // TODO: move this to a worker
  var gameGenerator = new L.GameGenerator();

  gameGenerator.on('progress', function (value) {
    console.log(value + '%');
    $('#generate').parent().children('.progress').remove();
    if (value < 100) {
      $('#generate').parent().prepend($('<span>', {class: 'progress', html: 'Generating game ... ' + value + '%'}));
    }
  });

  gameGenerator.on('done', function () {
    $('#generate').parent().children('.progress').remove();
  });

  gameGenerator.on('error', function () {
    $('#generate').parent().children('.progress').remove();
    $('#generate').parent().prepend($('<span>', {class: 'progress', html: 'Failed to generate. Please retry it.'}));
  });

  var dictionaryEl = $('#dictionary');
  var val = dictionaryEl.val();
  var language = val.split(':')[0];
  var dictName = val.split(':')[1];

  // var generatedGameDeferred = gameGenerator.generateGame('en', 'standard', 'WL2014', 'SQUARE');
  var generatedGameDeferred = gameGenerator.generateGame(language, 'standard', dictName, $('#scoring').val());

  generatedGameDeferred
    .then(function (generatedGame) {
      console.log(generatedGame);
      if (generatedGame) {
        addNewGame(generatedGame, 'LOCAL');
        selectGame(generatedGame.id);
        localGames[generatedGame.id] = generatedGame;
      }
    })
    .catch(function (err) {
      console.error(err);
    });
});

var activeGame = {};

$('#start').click(function () {
  console.log('Start a new game');
  var gameId = $('#game-selector').val();

  if (gameId) {
    var game = games[gameId];
    activeGame.id = game.id;
    loadGame(games[$('#game-selector').val()], {type: 'SINGLE_PLAYER'});
  }
});

$('#start-multiplayer').click(function () {
  console.log('Start a multiplayer game');
  var gameId = $('#game-selector').val();

  if (gameId) {
    var game = games[gameId];
    activeGame.id = game.id;

    if (games[game.id]) {
      request
        .post('/api/games/' + game.id)
        .send(game)
        .end(function (err, res) {
          if (err) {
            console.log(err);
          } else {
            done();
          }
        });
    } else {
      done();
    }
    function done() {
      loadGame(game, {type: 'MULTIPLAYER'});
    }
  }
});

$('#load').click(function () {
  console.log('Load a new game');
  var gameId = $('#game-selector').val();

  if (gameId) {
    var game = games[gameId];
    activeGame.id = game.id;
    loadGame(game, {type: 'REVIEW'});
  }
});

request
  .get('/Dictionary/info.json')
  .end(function (err, res) {
    if (err) {
      console.error(err);
      return;
    }
    var dictionaryEl = $('#dictionary');
    for (var i = 0; i < res.body.length; i += 1) {
      dictionaryEl.append($('<option>', {value: res.body[i].language + ':' + res.body[i].name, html: res.body[i].language + ' ' + res.body[i].name}))
    }
    if (res.body.length > 0) {
      dictionaryEl.val(res.body[res.body.length - 1].language + ':' + res.body[res.body.length - 1].name);
    }
  });


function reportBug(bug) {
  request
    .post('/api/bugs')
    .send(bug)
    .end(function (err, res) {
      if (err) {
        console.log(err);
      } else {
        console.log('bug was reported.');
      }
    });
}

function loadGame(game, opts) {
  console.log(game);
  var dictionary = new L.Dictionary(game.language + '/' + game.dictionary + '.json');
  var board = new L.Board(game.type);
  var score = new L.Score(board, dictionary, game.scoring);
  var rack = new L.Rack();
  var solver = new L.Solver(board, score, dictionary);
  var bag = new L.Bag(game.language, game.type, dictionary);

  bag.ready()
    .then(function () {

      // TODO: add game, bag, dictionary, board, score, rack, solver
      var SinglePlayerGame = function (opts) {
        this.turnId = -1;
        this.timer = 90; // in seconds
        this.moves = [];
        this.scores = [];
        this.currentMaxScore = 0;
        this.currentScore = 0;
        this.percentage = 100;
      };

      SinglePlayerGame.prototype.nextTurn = function () {
        if (this.turnId >= game.turns.length) {
          this.finish();
          return;
        }

        if (this.turnId >= 0) {
          // get score
          var move = checkMove(tilesOnRack);
          console.log(move);
          this.moves.push(move);

          // record score
          var percentage;
          var max = game.turns[this.turnId].score || 0;

          if (max === 0) {
            percentage = 100;
          } else {
            percentage = move.score / max
          }

          this.currentMaxScore += max;
          this.currentScore += move.score;

          this.percentage = Math.floor(this.currentScore / this.currentMaxScore * 100 * 100) / 100;

          this.scores.push({
            max: max,
            user: move.score,
            percentage: percentage
          });

          if (move.score > 0) {
            var solutions = solver.solve(rack);
            var found = false;
            for (var i = 0; i < solutions.length; i += 1) {
              if (solutions[i].score === move.score &&
                solutions[i].x === move.x &&
                solutions[i].y === move.y &&
                solutions[i].direction === move.direction) {

                  found = true;
                  break;
                }
            }

            if (found) {

            } else {
              var tilesUsed = tilesOnRack.filter(function (tileEl) {
                return tileEl.attr('data-x') !== '-1' && tileEl.attr('data-y') !== '-1';
              });
              var userRack = tilesUsed.map(function (tileEl) {
                return {
                  x: parseInt(tileEl.attr('data-x')),
                  y: parseInt(tileEl.attr('data-y')),
                  tile: {
                    letter: tileEl.find('.letter').attr('data-value'),
                    value: parseInt(tileEl.find('.value').attr('data-value'))
                  }
                };
              });

              reportBug({
                turnId: this.turnId,
                rack: userRack,
                move: move,
                game: game
              });
            }
          }

          // TODO: check if we have found the word that the user played.
          // TODO: add report bug
        }

        this.turnId += 1;

        // some UI related things that must be factored out
        $('.score-results').remove();
        var scoreEl = $('<div>', {class: 'score-results'});
        if (game.turns[this.turnId]) {
          scoreEl.append($('<div>', {html: ' Max score for this round: ' + game.turns[this.turnId].score + ' '}));
        }
        // max this.currentMaxScore 100%
        // move.score this.currentScore this.percentage
        var tEl = $('<table>');
        scoreEl.append(tEl);
        tEl.append($('<thead>', {html: '<tr><th>User</th><th>Score</th><th>Sum</th><th>Diff</th><th>%</th></tr>'}));
        var tbEl = $('<tbody>');
        tEl.append(tbEl);

        var trEl1 = $('<tr>', {html: '<td>' + 'Computer' + '</td>' + '<td>' + max + '</td>' + '<td>' + this.currentMaxScore + '</td>' + '<td>' + 0 + '</td>' + '<td>' + 100 + '%</td>'});
        tEl.append(trEl1);

        var diff = this.currentScore - this.currentMaxScore;
        var score = move ? move.score : 0;
        var trEl2 = $('<tr>', {html: '<td>' + 'User' + '</td>' + '<td>' + score + '</td>' + '<td>' + this.currentScore + '</td>' + '<td>' + diff + '</td>' + '<td>' + this.percentage + '%</td>'});
        tEl.append(trEl2);

        sidebarEl.append(scoreEl);

        // load next turn
        loadTurn(this.turnId);

        // reset timer
      };

      SinglePlayerGame.prototype.start = function () {
        // this.turnId = game.turns.length - 2;
        this.nextTurn();
      };

      SinglePlayerGame.prototype.finish = function () {
        // clear timer

        // load last turn
        loadTurn(game.turns.length - 1);
      };

      var gameEl = $('#game');
      gameEl.children().remove();

      var headerEl = $('#header');
      headerEl.children().remove();

      var pageheadEl = $('#pagehead');
      pageheadEl.children().remove();

      var sidebarEl = $('#sidebar');
      sidebarEl.children().remove();


      // game information
      var infoEl = $('<div>', {class: 'info'});
      infoEl.append($('<span>', {html: game.language}));
      infoEl.append($('<span>', {html: game.dictionary}));
      infoEl.append($('<span>', {html: 'Max score: ' + game.maxScore}));
      infoEl.append($('<span>', {html: 'Sum score: ' + game.sumScore}));
      infoEl.append($('<span>', {html: 'Avg score: ' + Math.floor(game.sumScore / game.turns.length * 100) / 100}));
      infoEl.append($('<span>', {html: 'Bingos: ' + game.numBingos}));
      infoEl.append($('<span>', {html: 'Scoring: ' + game.scoring}));

      pageheadEl.append(infoEl);

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

      // buttons
      // var buttonsEl = $('<div>', {class: 'buttons'});
      // gameEl.append(buttonsEl);

      // rack
      var rackEl = $('<div>', {class: 'rack'});
      var tilesOnRack = [];
      var rackControlsEl1 = $('<div>', {class: 'controls'});
      rackEl.append(rackControlsEl1);
      var rackTileContainerEl = $('<div>', {class: 'tile-container accept-tile-drop ui-droppable'});
      rackEl.append(rackTileContainerEl);
      var rackControlsEl2 = $('<div>', {class: 'controls'});
      rackEl.append(rackControlsEl2);
      rackTileContainerEl.droppable({
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

      var clearEl = $('<div>', {class: 'button', html: 'Clear'});

      clearEl.on('click', function () {
        for (var i = 0; i < tilesOnRack.length; i += 1) {
          rackTileContainerEl.append(tilesOnRack[i]);
          tilesOnRack[i].attr('data-x', -1);
          tilesOnRack[i].attr('data-y', -1);
        }
      });

      rackControlsEl1.append(clearEl);

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

        resultEl.append($('<div>', {class: 'message ' + (result.success ? 'valid' : 'invalid'), html: result.message}));
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
          var rowEl = $('<tr>', {class: result.words[i].valid ? 'valid' : 'invalid'});
          rowEl.append($('<td>', {html: dictionary.decode(result.words[i].word)}));
          rowEl.append($('<td>', {class: 'score', html: result.words[i].score}));
          partialScore += result.words[i].score;
          tbodyEl.append(rowEl);
        }


        var rowEl = $('<tr>', {class: 'extra'});
        rowEl.append($('<td>', {html: ''}));
        rowEl.append($('<td>', {class: 'score', html: Math.max(result.score - partialScore, 0)}));
        tbodyEl.append(rowEl);

        var rowEl = $('<tr>', {class: 'sum ' + (result.validMove ? 'valid' : 'invalid')});
        rowEl.append($('<td>', {html: dictionary.decode(result.word)}));
        rowEl.append($('<td>', {class: 'score', html: result.score}));
        tbodyEl.append(rowEl);

        resultEl.append(wordDetailsEl);

        // console.log(result);

        return result;
      }

      var solverResultEl = $('<div>', {class: 'solver-result'});

      sidebarEl.append(solverResultEl);

      if (opts.type === 'REVIEW') {
        // controls
        var controlsEl = $('<div>', {class: 'controls'});
        for (var i = 0; i <= game.turns.length; i += 1) {
          controlsEl.append(turnDescription(i));
        }

        function turnDescription(id) {
          var turn = game.turns[id] || {word: '', score: '', isBingo: ''};
          var el = $('<div>', {class: 'turn-description'});
          el.append($('<span>', {html: id + 1}));
          var loadBtn = $('<div>', {class: 'button', html: 'Load'});
          loadBtn.on('click', function () {
            loadTurn(id);
          });
          el.append(loadBtn);
          el.append($('<span>', {html: dictionary.decode(turn.word)}));
          el.append($('<span>', {html: turn.score}));
          el.append($('<span>', {html: turn.isBingo ? 'Bingo' : ''}));
          return el;
        }

        sidebarEl.append(controlsEl);

        loadTurn(0);
      } else if (opts.type === 'SINGLE_PLAYER') {
        var singlePlayer = new SinglePlayerGame();
        singlePlayer.start();

        var okEl = $('<div>', {class: 'button', html: 'OK'});
        okEl.on('click', function () {
          okEl.prop('disabled', true);
          singlePlayer.nextTurn();
          // remove solver results
          solverResultEl.children().remove();

          setTimeout(function () {
            okEl.prop('disabled', false);
          }, 1000);
        });
        rackControlsEl2.append(okEl);
      } else if (opts.type === 'MULTIPLAYER_PLAYER') {
        console.log('Waiting for users ...');
        // TODO: add a new start button
        // TODO: add a timer
      }

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
            var placeEl = $('#game table.board tbody tr:nth-child(' + (move.y + 1) + ') ' + 'td:nth-child(' + (move.x + 1) + ') ');
            placeEl.append(newTile(move.tile));
            placeEl.find('.ui-droppable').removeClass('accept-tile-drop');
          }
        }

        var rackEl = $('div.rack');
        rackEl.find('.tile').remove();
        tilesOnRack = [];
        rack.clear();
        for (var i = 0; i < tilesOnRack.length; i += 1) {
          tilesOnRack[i].remove();
        }
        if (turnId < game.turns.length) {
          for (var j = 0; j < game.turns[turnId].rack.length; j += 1) {
            var tile = game.turns[turnId].rack[j];
            // console.log('Add letter:', game.turns[i].move[j]);
            var tileEl = newTile(tile, true);
            tileEl.addClass('on-rack');
            tileEl.attr('data-x', -1);
            tileEl.attr('data-y', -1);
            tilesOnRack.push(tileEl);
            rack.addTile(new L.Tile(tile.letter, tile.value));
            rackTileContainerEl.append(tileEl);
          }

          var solutions = solver.solve(rack);
          if (game.turns[turnId].numSolutions !== solutions.length) {
            console.log(game.turns[turnId].numSolutions, solutions.length, solutions[0]);
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
        var letterEl = $('<div>', {class: 'letter', 'data-value': dictionary.encode([tile.letter]), html: decodedLetter});
        if (decodedLetter.length === 3) {
          letterEl.addClass('three-letters');
        }
        tileEl.append(letterEl);
        tileEl.append($('<div>', {class: 'value', 'data-value': tile.value, html: tile.value ? tile.value : ''}));
        if (tile.value === 0) {
          // blank
          tileEl.addClass('blank');
          if (draggable) {
            tileEl.on('dblclick', function () {
              console.log('open selection');
              $('.blank-selection').remove();
              var blankSelectionEl = $('<div>', {class: 'blank-selection'});
              $('.rack').append(blankSelectionEl);


              function addBlankTile(l) {
                var blankTileEl = newTile({letter: bag.blankSelection[i], value: 0});
                blankSelectionEl.append(blankTileEl);
                blankTileEl.on('click', function () {
                  var decodedLetter = blankTileEl.children('.letter').html();
                  letterEl.html(decodedLetter);
                  letterEl.attr('data-value', blankTileEl.children('.letter').attr('data-value'));
                  letterEl.removeClass('three-letters');
                  if (decodedLetter.length === 3) {
                    letterEl.addClass('three-letters');
                  }
                  checkMove(tilesOnRack);
                  blankSelectionEl.remove();
                });
              }
              for (var i = 0; i < bag.blankSelection.length; i += 1) {
                addBlankTile(bag.blankSelection[i]);
              }

            });
          }
        }
        return tileEl;
      }

    })
    .catch(function (err) {
      console.error(err);
      throw err;
    });
}

var games = {};
var localGames = {};

function addNewGame(game, comment) {
  games[game.id] = game;
  var text = game.id.substring(0, 6) + ' ' + game.language + ' ' + game.sumScore + ' ' + game.numBingos + ' ' + game.maxScore;
  if (comment) {
    text += ' [' + comment + ']';
  }
  var newOptionEl = $('<option>', {value: game.id, html: text});
  $('#game-selector').prepend(newOptionEl);
}

function selectGame(id) {
  $('#game-selector').val(id).change();
}

request
  .get('/api/games/')
  .end(function (err, res) {
    if (err) {
      console.error(err);
      return;
    }
    // console.log(res);
    var gameIds = res.body;


    $('#game-selector').on('change', function () {
      loadGame(games[$('#game-selector').val()], {type: 'REVIEW'});
    });

    for (var i = 0; i < gameIds.length; i += 1) {
      request
        .get('/api/games/' + gameIds[i])
        .end(function (err, res) {
          var game = res.body;
          addNewGame(game);
          if (Object.keys(games).length === 1) {
            selectGame(game.id);
          }
        });
    }


  });
