'use strict';

function run(maxTurns) {
  var Score = require('../Score/Score');
  var Board = require('../Board/Board');
  var Bag = require('../Bag/Bag');
  var Rack = require('../Rack/Rack');

  var Dictionary = require('../Dictionary/Dictionary');


  var Tile = require('../Bag/Tile');

  var Solver = require('../Solver/Solver');

  var dict = require('../Dictionary/en/WL2014.json');
  var bag = new Bag('en', 'standard');

  var dict = require('../Dictionary/hu/me2003.json');
  var bag = new Bag('hu', 'standard');

  var dictionary = new Dictionary(dict);

  // encode Bag
  for (var k = 0; k < bag.origianalTiles.length; k += 1) {
    bag.origianalTiles[k].letter = dictionary.encode([bag.origianalTiles[k].letter]);
  }

  var board = new Board();
  var score = new Score(board, dictionary);
  var rack = new Rack();
  var solver = new Solver(board, score, dictionary);

  function newTurn(solution) {
    var i;
    var result = true;

    if (solution.move) {
      var move = solution.move;
      var s = score.getScore(move);
      var moveResult = board.makeMove(move);
      if (moveResult.message === 'BOARD_MOVE_IS_EMPTY') {
        result = false;
      }
      sumScore += s.score;
      //console.log(moveResult, s);
      for (i = 0; i < move.length; i += 1) {
        rack.removeTile(move[i].tile);
      }
    }

    var numTiles = 7 - rack.getTiles().length;
    for (i = 0; i < numTiles; i += 1) {
      var tile = bag.getTile();
      if (tile) {
        rack.addTile(tile);
      } else {
        // no more tiles
        if (rack.getTiles().length === 0) {
          result = false;
        }
      }
    }

    turnId += 1;

    console.log('///////// TURN ' + turnId + ' /////////');
    if (s) {
      console.log('MOVE: ' + s.word + ' ' + s.score + ' ' + sumScore);
    }
    console.log('RACK: ' + rack.tiles.map(function (t) { return t.letter; }).join(', '));
    console.log('BAG: ' + bag.getNumRemainingTiles());
    console.log(board.printBoard(true).join('\n'));

    return result;
  }

  var sumScore = 0;
  var solutions = [{}];
  var turnId = 0;
  while (newTurn(solutions[0]) && turnId < maxTurns) {
    console.log(turnId);
    solutions = solver.solve(rack);
  }
  return {sumScore:sumScore, turnId: turnId};
}

var stats = [];

for (var i = 0; i < 1; i += 1) {
  var stat = {
    id: i,
    start: (new Date()).getTime(),
    end: null,
    duration: null,
    sumScore: 0,
    turns: 1
  };
  var result = run(15);
  stat.end = (new Date()).getTime();
  stat.duration = stat.end - stat.start;
  stat.sumScore = result.sumScore;
  stat.turns = result.turnId + 1;
  stats.push(stat);
}

console.log(stats);
var maxDuration = -1;
var minDuration = 99999999999;
var avgDuration = -1;
var sumDuration = 0;
for (var i = 0; i < stats.length; i += 1) {
  sumDuration += stats[i].duration;
  if (stats[i].duration < minDuration) {
    minDuration = stats[i].duration;
  }
  if (stats[i].duration > maxDuration) {
    maxDuration = stats[i].duration;
  }
}
avgDuration = sumDuration / stats.length;

console.log('////// STATS //////');
console.log('// max:', maxDuration);
console.log('// min:', minDuration);
console.log('// avg:', avgDuration);
console.log('// sum:', sumDuration);
console.log('// #:', stats.length);
