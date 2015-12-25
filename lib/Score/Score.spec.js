'use strict';

var assert = require('assert');
var Score = require('./Score');
var Board = require('../Board/Board');

var Dictionary = require('../Dictionary/Dictionary');
var enDict = require('../Dictionary/en/WL2014.json');
var dictionary = new Dictionary(enDict);

var Tile = require('../Bag/Tile');

describe('Score', function() {
  it('should fail to score with invalid move', function () {
    var board = new Board();
    var score = new Score(board, dictionary);
    // move
    var move = [
      {x: 10, y: 7, tile: new Tile('a', 1)},
      {x: 8, y: 7, tile: new Tile('a', 1)}
    ];
    // set tiles

    var result = score.getScore(move);
    assert.equal(result.success, false);
    assert.equal(result.score, 0);
    assert.equal(result.validMove, false);
  });

  it('should fail to score with invalid word', function () {
    var board = new Board();
    var score = new Score(board, dictionary);
    // move
    var move = [
      {x: 7, y: 7, tile: new Tile('e', 1)},
      {x: 8, y: 7, tile: new Tile('e', 1)}
    ];
    // set tiles

    var result = score.getScore(move);
    assert.equal(result.success, true);
    assert.equal(result.score, 0);
    assert.equal(result.message, 'SCORE_INVALID_WORD');
    assert.equal(result.validMove, false);
  });

  it('should get score for phony word if ignore=true', function () {
    var board = new Board();
    var score = new Score(board, dictionary);
    // move
    var move = [
      {x: 7, y: 7, tile: new Tile('e', 1)},
      {x: 8, y: 7, tile: new Tile('e', 1)}
    ];
    // set tiles

    var result = score.getScore(move, true);
    assert.equal(result.success, true);
    assert.equal(result.score, 4);
    assert.equal(result.validMove, true);
    assert.equal(result.word, 'ee');
  });

  describe('x direction', function () {
    it('should get score for initial word', function () {
      var board = new Board();
      var score = new Score(board, dictionary);
      // move
      var move = [
        {x: 7, y: 7, tile: new Tile('a', 1)},
        {x: 8, y: 7, tile: new Tile('a', 1)}
      ];
      // set tiles

      var result = score.getScore(move);
      assert.equal(result.success, true);
      assert.equal(result.score, 4);
      assert.equal(result.word, 'aa');
    });

    it('should get score 54 for 8-letter word (seatings)', function () {
      var board = new Board();
      var score = new Score(board, dictionary);
      // move
      var move = [
        {x: 7, y: 7, tile: new Tile('s', 1)},
        {x: 8, y: 7, tile: new Tile('e', 1)},
        {x: 9, y: 7, tile: new Tile('a', 1)},
        {x: 10, y: 7, tile: new Tile('t', 1)},
        {x: 11, y: 7, tile: new Tile('i', 1)},
        {x: 12, y: 7, tile: new Tile('n', 1)},
        {x: 13, y: 7, tile: new Tile('g', 1)},
        {x: 14, y: 7, tile: new Tile('s', 1)}
      ];
      // set tiles

      var result = score.getScore(move);
      assert.equal(result.success, true);
      assert.equal(result.score, 54);
      assert.equal(result.word, 'seatings');
    });

    it('should get score +50 points for 7-letter word (seating)', function () {
      var board = new Board();
      var score = new Score(board, dictionary);
      // move
      var move = [
        {x: 7, y: 7, tile: new Tile('s', 1)},
        {x: 8, y: 7, tile: new Tile('e', 1)},
        {x: 9, y: 7, tile: new Tile('a', 1)},
        {x: 10, y: 7, tile: new Tile('t', 1)},
        {x: 11, y: 7, tile: new Tile('i', 1)},
        {x: 12, y: 7, tile: new Tile('n', 1)},
        {x: 13, y: 7, tile: new Tile('g', 1)}
      ];
      // set tiles

      var result = score.getScore(move);
      assert.equal(result.success, true);
      assert.equal(result.score, 66);
      assert.equal(result.word, 'seating');
    });

    it('should get score for prefix', function () {
      var board = new Board();
      var score = new Score(board, dictionary);
      // move
      var move = [
        {x: 5, y: 7, tile: new Tile('s', 1)},
        {x: 6, y: 7, tile: new Tile('h', 3)}
      ];
      // set tiles
      board.setTile(7, 7, new Tile('e', 1));
      board.setTile(8, 7, new Tile('e', 1));
      board.setTile(9, 7, new Tile('t', 1));
      var result = score.getScore(move);
      assert.equal(result.success, true);
      assert.equal(result.score, 7);
      assert.equal(result.word, 'sheet');
    });

    it('should get score for suffix', function () {
      var board = new Board();
      var score = new Score(board, dictionary);
      // move
      var move = [
        {x: 10, y: 7, tile: new Tile('i', 1)},
        {x: 11, y: 7, tile: new Tile('n', 1)},
        {x: 12, y: 7, tile: new Tile('g', 1)}
      ];
      // set tiles
      board.setTile(7, 7, new Tile('e', 1));
      board.setTile(8, 7, new Tile('a', 1));
      board.setTile(9, 7, new Tile('t', 1));
      var result = score.getScore(move);
      assert.equal(result.success, true);
      assert.equal(result.score, 7);
      assert.equal(result.word, 'eating');
    });

    it('should get score for prefix and suffix', function () {
      var board = new Board();
      var score = new Score(board, dictionary);
      // move
      var move = [
        {x: 6, y: 7, tile: new Tile('s', 1)},
        {x: 10, y: 7, tile: new Tile('i', 1)},
        {x: 11, y: 7, tile: new Tile('n', 1)},
        {x: 12, y: 7, tile: new Tile('g', 1)},
        {x: 13, y: 7, tile: new Tile('s', 1)}
      ];
      // set tiles
      board.setTile(7, 7, new Tile('e', 1));
      board.setTile(8, 7, new Tile('a', 1));
      board.setTile(9, 7, new Tile('t', 1));
      var result = score.getScore(move);
      assert.equal(result.success, true);
      assert.equal(result.score, 9);
      assert.equal(result.word, 'seatings');
    });

    it('should get score for single letter cross word', function () {
      var board = new Board();
      var score = new Score(board, dictionary);
      // move
      var move = [
        {x: 8, y: 6, tile: new Tile('b', 2)},
      ];
      // set tiles
      board.setTile(7, 7, new Tile('e', 1));
      board.setTile(8, 7, new Tile('a', 1));
      board.setTile(9, 7, new Tile('t', 1));
      var result = score.getScore(move);
      assert.equal(result.success, true);
      assert.equal(result.score, 5);
      assert.equal(result.word, 'ba');
    });

    it('should get score for two-letter cross word', function () {
      var board = new Board();
      var score = new Score(board, dictionary);
      // move
      var move = [
        {x: 8, y: 6, tile: new Tile('b', 2)},
        {x: 9, y: 6, tile: new Tile('i', 1)}
      ];
      // set tiles
      board.setTile(7, 7, new Tile('e', 1));
      board.setTile(8, 7, new Tile('a', 1));
      board.setTile(9, 7, new Tile('t', 1));
      var result = score.getScore(move);
      assert.equal(result.success, true);
      assert.equal(result.score, 12);
      assert.equal(result.word, 'bi');
    });

    it('should get score for cross word multiplier', function () {
      var board = new Board();
      var score = new Score(board, dictionary);
      // move
      var move = [
        {x: 10, y: 10, tile: new Tile('s', 1)},
        {x: 11, y: 10, tile: new Tile('h', 3)}
      ];
      // set tiles
      board.setTile(7, 7, new Tile('e', 1));
      board.setTile(8, 7, new Tile('a', 1));
      board.setTile(9, 7, new Tile('t', 1));
      board.setTile(10, 7, new Tile('s', 1));
      board.setTile(10, 8, new Tile('e', 1));
      board.setTile(10, 9, new Tile('e', 1));
      var result = score.getScore(move);
      assert.equal(result.success, true);
      assert.equal(result.score, 16);
      assert.equal(result.word, 'sh');
    });
  });


  describe('y direction', function () {
    it('should get score for initial word', function () {
      var board = new Board();
      var score = new Score(board, dictionary);
      // move
      var move = [
        {x: 7, y: 7, tile: new Tile('a', 1)},
        {x: 7, y: 8, tile: new Tile('a', 1)}
      ];
      // set tiles

      var result = score.getScore(move);
      assert.equal(result.success, true);
      assert.equal(result.score, 4);
      assert.equal(result.word, 'aa');
    });

    it('should get score +50 points for 7-letter word (seating)', function () {
      var board = new Board();
      var score = new Score(board, dictionary);
      // move
      var move = [
        {x: 7, y: 7, tile: new Tile('s', 1)},
        {x: 7, y: 8, tile: new Tile('e', 1)},
        {x: 7, y: 9, tile: new Tile('a', 1)},
        {x: 7, y: 10, tile: new Tile('t', 1)},
        {x: 7, y: 11, tile: new Tile('i', 1)},
        {x: 7, y: 12, tile: new Tile('n', 1)},
        {x: 7, y: 13, tile: new Tile('g', 1)}
      ];
      // set tiles

      var result = score.getScore(move);
      assert.equal(result.success, true);
      assert.equal(result.score, 66);
      assert.equal(result.word, 'seating');
    });

    it('should get score 54 for 8-letter word (seatings)', function () {
      var board = new Board();
      var score = new Score(board, dictionary);
      // move
      var move = [
        {x: 7, y: 7, tile: new Tile('s', 1)},
        {x: 7, y: 8, tile: new Tile('e', 1)},
        {x: 7, y: 9, tile: new Tile('a', 1)},
        {x: 7, y: 10, tile: new Tile('t', 1)},
        {x: 7, y: 11, tile: new Tile('i', 1)},
        {x: 7, y: 12, tile: new Tile('n', 1)},
        {x: 7, y: 13, tile: new Tile('g', 1)},
        {x: 7, y: 14, tile: new Tile('s', 1)}
      ];
      // set tiles

      var result = score.getScore(move);
      assert.equal(result.success, true);
      assert.equal(result.score, 54);
      assert.equal(result.word, 'seatings');
    });

    it('should get score for prefix', function () {
      var board = new Board();
      var score = new Score(board, dictionary);
      // move
      var move = [
        {x: 7, y: 5, tile: new Tile('s', 1)},
        {x: 7, y: 6, tile: new Tile('h', 3)}
      ];
      // set tiles
      board.setTile(7, 7, new Tile('e', 1));
      board.setTile(7, 8, new Tile('e', 1));
      board.setTile(7, 9, new Tile('t', 1));
      var result = score.getScore(move);
      assert.equal(result.success, true);
      assert.equal(result.score, 7);
      assert.equal(result.word, 'sheet');
    });

    it('should get score for suffix', function () {
      var board = new Board();
      var score = new Score(board, dictionary);
      // move
      var move = [
        {x: 7, y: 10, tile: new Tile('i', 1)},
        {x: 7, y: 11, tile: new Tile('n', 1)},
        {x: 7, y: 12, tile: new Tile('g', 1)}
      ];
      // set tiles
      board.setTile(7, 7, new Tile('e', 1));
      board.setTile(7, 8, new Tile('a', 1));
      board.setTile(7, 9, new Tile('t', 1));
      var result = score.getScore(move);
      assert.equal(result.success, true);
      assert.equal(result.score, 7);
      assert.equal(result.word, 'eating');
    });

    it('should get score for prefix and suffix', function () {
      var board = new Board();
      var score = new Score(board, dictionary);
      // move
      var move = [
        {x: 7, y: 6, tile: new Tile('s', 1)},
        {x: 7, y: 10, tile: new Tile('i', 1)},
        {x: 7, y: 11, tile: new Tile('n', 1)},
        {x: 7, y: 12, tile: new Tile('g', 1)},
        {x: 7, y: 13, tile: new Tile('s', 1)}
      ];
      // set tiles
      board.setTile(7, 7, new Tile('e', 1));
      board.setTile(7, 8, new Tile('a', 1));
      board.setTile(7, 9, new Tile('t', 1));
      var result = score.getScore(move);
      assert.equal(result.success, true);
      assert.equal(result.score, 9);
      assert.equal(result.word, 'seatings');
    });

    it('should get score for single letter cross word', function () {
      var board = new Board();
      var score = new Score(board, dictionary);
      // move
      var move = [
        {x: 6, y: 8, tile: new Tile('b', 2)},
      ];
      // set tiles
      board.setTile(7, 7, new Tile('e', 1));
      board.setTile(7, 8, new Tile('a', 1));
      board.setTile(7, 9, new Tile('t', 1));
      var result = score.getScore(move);
      assert.equal(result.success, true);
      assert.equal(result.score, 5);
      assert.equal(result.word, 'ba');
    });

    it('should get score for two-letter cross word', function () {
      var board = new Board();
      var score = new Score(board, dictionary);
      // move
      var move = [
        {x: 6, y: 8, tile: new Tile('b', 2)},
        {x: 6, y: 9, tile: new Tile('i', 1)}
      ];
      // set tiles
      board.setTile(7, 7, new Tile('e', 1));
      board.setTile(7, 8, new Tile('a', 1));
      board.setTile(7, 9, new Tile('t', 1));
      var result = score.getScore(move);
      assert.equal(result.success, true);
      assert.equal(result.score, 12);
      assert.equal(result.word, 'bi');
    });

    it('should get score for cross word multiplier', function () {
      var board = new Board();
      var score = new Score(board, dictionary);
      // move
      var move = [
        {x: 10, y: 10, tile: new Tile('s', 1)},
        {x: 10, y: 11, tile: new Tile('h', 3)}
      ];
      // set tiles
      board.setTile(7, 7, new Tile('e', 1));
      board.setTile(7, 8, new Tile('a', 1));
      board.setTile(7, 9, new Tile('t', 1));
      board.setTile(7, 10, new Tile('s', 1));
      board.setTile(8, 10, new Tile('e', 1));
      board.setTile(9, 10, new Tile('e', 1));
      var result = score.getScore(move);
      assert.equal(result.success, true);
      assert.equal(result.score, 16);
      assert.equal(result.word, 'sh');
    });
  });
});
