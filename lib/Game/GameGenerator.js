'use strict';

var utils = require('../utils');
var jsSHA = require('jssha');
var Score = require('../Score/Score');
var Board = require('../Board/Board');
var Bag = require('../Bag/Bag');
var Rack = require('../Rack/Rack');
var Dictionary = require('../Dictionary/Dictionary');
var Tile = require('../Bag/Tile');
var Solver = require('../Solver/Solver');
var Q = require('q');

var GameGenerator = function () {

};

GameGenerator.prototype.generateGame = function (language, type, dictionary, scoring) {
  var result = {
    id: '',
    language: language,
    type: type,
    dictionary: dictionary,
    scoring: scoring,
    sumScore: 0,
    numBingos: 0,
    maxScore: 0,
    turns: []
  };

  console.log('Generating a new game: ', language, type, dictionary, scoring);

  var dictionary = new Dictionary(language + '/' + dictionary + '.json');
  var bag = new Bag(language, type, dictionary);

  var deferred = Q.defer();

  bag.ready()
    .then(function () {
      var board = new Board();
      var score = new Score(board, dictionary, scoring);
      var rack = new Rack();
      var solver = new Solver(board, score, dictionary);

      var solutions = [{}];
      var turnId = 0;

      var generationStarted = new Date().getTime();

      function newTurn(solution) {
        var i;
        var turnResult = true;

        if (solution.move) {
          var move = solution.move;
          var s = score.getScore(move);
          var moveResult = board.makeMove(move);
          if (moveResult.message === 'BOARD_MOVE_IS_EMPTY') {
            turnResult = false;
          }

          var turn = {
            rack: rack.getTiles().map(function (t) { return t.toJSON(); }),
            move: move.map(function (m) { return {x: m.x, y: m.y, tile: m.tile.toJSON()}; }),
            isBingo: s.isBingo,
            score: s.score,
            word: s.word
          };
          result.turns.push(turn);

          if (s.isBingo) {
            result.numBingos += 1;
          }
          if (s.score > result.maxScore) {
            result.maxScore = s.score;
          }
          result.sumScore += s.score;

          //console.log(moveResult, s);
          for (i = 0; i < move.length; i += 1) {
            rack.removeTile(move[i].tile);
          }
        }

        var numTiles = 7 - rack.getTiles().length;
        var notLastTurn = bag.getNumRemainingTiles() - numTiles > 0;
        for (i = 0; i < numTiles; i += 1) {
          var tile = null;
          if (i === numTiles - 1 && notLastTurn) {
            var stat = dictionary.countVowelsAndConsonants(rack.getTiles().map(function (t) { return t.letter; }));
            if (stat.numConsonants === 0) {
              console.log('No consonants:', rack.getTiles().map(function (t) { return t.letter; }).join(''));
              tile = bag.getConsonant();
              if (tile) {

              } else {
                turnResult = false;
              }
            }
            if (stat.numVowels === 0) {
              console.log('No vowels:', rack.getTiles().map(function (t) { return t.letter; }).join(''));
              tile = bag.getVowel();
              if (tile) {

              } else {
                turnResult = false;
              }
            }
          }

          if (tile) {

          } else {
            tile = bag.getTile();
          }

          if (tile) {
            rack.addTile(tile);
          } else {
            // no more tiles
            if (rack.getTiles().length === 0) {
              turnResult = false;
            }
          }
        }
        // console.log(turnId, bag.getNumRemainingTiles());
        turnId += 1;

        // console.log('///////// TURN ' + turnId + ' /////////');
        // if (s) {
        //   console.log('MOVE: ' + s.word + ' ' + s.score + ' ' + sumScore);
        // }
        // console.log('RACK: ' + rack.tiles.map(function (t) { return t.letter; }).join(', '));
        // console.log('BAG: ' + bag.getNumRemainingTiles());
        // console.log(board.printBoard(true).join('\n'));

        return turnResult;
      }

      // while (newTurn(solutions[0]) && turnId < 10) {
      while (newTurn(solutions[0])) {
        console.log(turnId, rack.tiles.map(function (t) { return t.letter; }).join(' '), solutions[0].score, solutions[0].word);
        solutions = solver.solve(rack);
      }

      console.log(dictionary.cntGetSubWord);

      var shaObj = new jsSHA('SHA-1', 'TEXT');
      shaObj.update(JSON.stringify(result));
      result.id = shaObj.getHash('HEX');

      console.log('Took', (new Date().getTime() - generationStarted)/1000, 's');
      if (bag.getNumRemainingTiles() > 0) {
        console.error('Failed to generate: ', result.id);
        return;
      } else {
        console.log('Generated: ', result.id);
        return result;
      }
    })
    .then(deferred.resolve)
    .catch(deferred.reject);

  return deferred.promise;
};

module.exports = GameGenerator;
