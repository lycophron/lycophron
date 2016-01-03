'use strict';

var assert = require('assert');
var Board = require('./Board');
var Tile = require('../Bag/Tile');

describe('Board', function() {
  it('should create a new instance', function () {
    var board = new Board();
    assert.equal(board.x, 15);
    assert.equal(board.y, 15);
    assert.equal(board.xStart, 7);
    assert.equal(board.yStart, 7);
  });

  it('should get board size', function () {
    var board = new Board();
    assert.deepEqual(board.getSize(), {x: 15, y: 15});
  });

  it('should set/get tile', function () {
    var board = new Board();
    var tile = {};
    assert.equal(board.setTile(0, 0, tile), undefined);
    assert.equal(board.getTile(0, 0), tile);
  });

  it('should set/get tile', function () {
    var board = new Board();
    var tile = {};
    assert.equal(board.setTile(0, 0, tile), undefined);
    assert.equal(board.getTile(0, 0), tile);
  });

  it('should clear board', function () {
    var board = new Board();
    var tile = {};
    board.setTile(0, 0, tile);
    assert.equal(board.getTile(0, 0), tile);
    board.clear();
    assert.equal(board.getTile(0, 0), null);
  });

  it('should get modifier value', function () {
    var board = new Board();
    assert.deepEqual(board.getModifier(0, 0), {type: 'WORD', multiplier: 3});
    assert.deepEqual(board.getModifier(7, 7), {type: 'WORD', multiplier: 2});
    assert.deepEqual(board.getModifier(7, 8), {type: 'LETTER', multiplier: 1});
  });

  it('should print modifiers', function () {
    var board = new Board();
    assert.equal(board.printModifiers().length, 15);
  });

  it('should print board', function () {
    var board = new Board();
    var tile = new Tile('S', 1);
    board.setTile(0, 0, tile);
    assert.equal(board.printBoard().length, 15);
    assert.equal(board.printBoard(true).length, 15);
    assert.equal(board.printBoard(false).length, 15);
  });

  describe('#isValidMove', function () {
    it('should be invalid move with no tiles', function () {
      var board = new Board();
      var move = [
      ];
      // set tiles

      // check move
      var result = board.isValidMove(move);
      assert.equal(result.success, false);
      assert.equal(result.message, 'BOARD_MOVE_IS_EMPTY');
    });

    it('should be invalid move starting with one tile at starting position', function () {
      var board = new Board();
      var move = [
        {x: 7, y: 7, tile: new Tile('S', 1)}
      ];
      // set tiles

      // check move
      var result = board.isValidMove(move);
      assert.equal(result.success, false);
      assert.equal(result.message, 'BOARD_MOVE_AT_LEAST_TWO_TILES_MUST_BE_USED');
    });

    it('should be invalid move starting with one tile', function () {
      var board = new Board();
      var move = [
        {x: 7, y: 10, tile: new Tile('S', 1)}
      ];
      // set tiles

      // check move
      var result = board.isValidMove(move);
      assert.equal(result.success, false);
      assert.equal(result.message, 'BOARD_MOVE_INVALID_START_POSITION');
    });

    it('should be invalid move starting with two tiles outside of starting position', function () {
      var board = new Board();
      var move = [
        {x: 7, y: 10, tile: new Tile('S', 1)},
        {x: 7, y: 11, tile: new Tile('S', 1)}
      ];
      // set tiles

      // check move
      var result = board.isValidMove(move);
      assert.equal(result.success, false);
      assert.equal(result.message, 'BOARD_MOVE_INVALID_START_POSITION');
    });

    it('should be valid starting with at least two tiles at starting position', function () {
      var board = new Board();
      var move = [
        {x: 7, y: 7, tile: new Tile('S', 1)},
        {x: 7, y: 8, tile: new Tile('S', 1)}
      ];
      // set tiles

      // check move
      var result = board.isValidMove(move);
      assert.equal(result.success, true);
      assert.equal(result.message, 'BOARD_MOVE_OK');
      assert.equal(result.direction, 'y');
    });

    it('should be valid starting with three tiles at starting position', function () {
      var board = new Board();
      var move = [
        {x: 7, y: 7, tile: new Tile('S', 1)},
        {x: 8, y: 7, tile: new Tile('S', 1)},
        {x: 6, y: 7, tile: new Tile('S', 1)}
      ];
      // set tiles

      // check move
      var result = board.isValidMove(move);
      assert.equal(result.success, true);
      assert.equal(result.message, 'BOARD_MOVE_OK');
      assert.equal(result.direction, 'x');
    });

    it('should be invalid if not connected to other tiles', function () {
      var board = new Board();
      var move = [
        {x: 7, y: 5, tile: new Tile('S', 1)},
        {x: 8, y: 5, tile: new Tile('S', 1)},
        {x: 6, y: 5, tile: new Tile('S', 1)}
      ];
      // set tiles
      board.setTile(7, 7, new Tile('A', 1));
      board.setTile(7, 8, new Tile('A', 1));
      board.setTile(7, 9, new Tile('A', 1));
      board.setTile(8, 7, new Tile('A', 1));
      board.setTile(9, 7, new Tile('A', 1));
      // check move
      var result = board.isValidMove(move);
      assert.equal(result.success, false);
      assert.equal(result.message, 'BOARD_MOVE_TILES_MUST_BE_CONNECTED_TO_TILES_ON_BOARD');
      assert.equal(result.direction, 'x');
    });

    it('should be invalid if position has tile already', function () {
      var board = new Board();
      var move = [
        {x: 7, y: 7, tile: new Tile('S', 1)}
      ];
      // set tiles
      board.setTile(7, 7, new Tile('A', 1));
      board.setTile(7, 8, new Tile('A', 1));
      board.setTile(7, 9, new Tile('A', 1));
      board.setTile(8, 7, new Tile('A', 1));
      board.setTile(9, 7, new Tile('A', 1));
      // check move
      var result = board.isValidMove(move);
      assert.equal(result.success, false);
      assert.equal(result.message, 'BOARD_MOVE_PLACES_A_LETTER_ON_ANOTHER_ONE');
    });

    it('should be invalid if not in one line', function () {
      var board = new Board();
      var move = [
        {x: 8, y: 8, tile: new Tile('S', 1)},
        {x: 7, y: 10, tile: new Tile('S', 1)}
      ];
      // set tiles
      board.setTile(7, 7, new Tile('A', 1));
      board.setTile(7, 8, new Tile('A', 1));
      board.setTile(7, 9, new Tile('A', 1));
      board.setTile(8, 7, new Tile('A', 1));
      board.setTile(9, 7, new Tile('A', 1));
      // check move
      var result = board.isValidMove(move);
      assert.equal(result.success, false);
      assert.equal(result.message, 'BOARD_MOVE_NOT_INLINE');
      assert.equal(result.direction, null);
    });

    it('should be invalid if disconnected', function () {
      var board = new Board();
      var move = [
        {x: 0, y: 8, tile: new Tile('S', 1)},
        {x: 8, y: 8, tile: new Tile('S', 1)},
        {x: 5, y: 8, tile: new Tile('S', 1)}
      ];
      // set tiles
      board.setTile(7, 7, new Tile('A', 1));
      board.setTile(7, 8, new Tile('A', 1));
      board.setTile(7, 9, new Tile('A', 1));
      board.setTile(8, 7, new Tile('A', 1));
      board.setTile(9, 7, new Tile('A', 1));
      // check move
      var result = board.isValidMove(move);
      assert.equal(result.success, false);
      assert.equal(result.message, 'BOARD_MOVE_TILES_ARE_DISCONNECTED');
      assert.equal(result.direction, 'x');
    });

    it('should be invalid if position is negative', function () {
      var board = new Board();
      var move = [
        {x: -1, y: -1, tile: new Tile('S', 1)}
      ];
      // set tiles
      board.setTile(7, 7, new Tile('A', 1));
      board.setTile(7, 8, new Tile('A', 1));
      board.setTile(7, 9, new Tile('A', 1));
      board.setTile(8, 7, new Tile('A', 1));
      board.setTile(9, 7, new Tile('A', 1));
      // check move
      var result = board.isValidMove(move);
      assert.equal(result.success, false);
      assert.equal(result.message, 'BOARD_MOVE_WITH_NEGATIVE_COORDINATE');
      assert.equal(result.direction, 'x');
    });

    it('should be invalid if position is too big', function () {
      var board = new Board();
      var move = [
        {x: board.x, y: board.y, tile: new Tile('S', 1)}
      ];
      // set tiles
      board.setTile(7, 7, new Tile('A', 1));
      board.setTile(7, 8, new Tile('A', 1));
      board.setTile(7, 9, new Tile('A', 1));
      board.setTile(8, 7, new Tile('A', 1));
      board.setTile(9, 7, new Tile('A', 1));
      // check move
      var result = board.isValidMove(move);
      assert.equal(result.success, false);
      assert.equal(result.message, 'BOARD_MOVE_WITH_TOO_BIG_COORDINATE');
      assert.equal(result.direction, 'x');
    });

    it('should be valid to x direction', function () {
      var board = new Board();
      var move = [
        {x: 6, y: 8, tile: new Tile('S', 1)},
        {x: 8, y: 8, tile: new Tile('S', 1)},
        {x: 5, y: 8, tile: new Tile('S', 1)}
      ];
      // set tiles
      board.setTile(7, 7, new Tile('A', 1));
      board.setTile(7, 8, new Tile('A', 1));
      board.setTile(7, 9, new Tile('A', 1));
      board.setTile(8, 7, new Tile('A', 1));
      board.setTile(9, 7, new Tile('A', 1));
      // check move
      var result = board.isValidMove(move);
      assert.equal(result.success, true);
      assert.equal(result.message, 'BOARD_MOVE_OK');
      assert.equal(result.direction, 'x');
    });

    it('should be valid to y direction', function () {
      var board = new Board();
      var move = [
        {x: 7, y: 10, tile: new Tile('S', 1)},
        {x: 7, y: 5, tile: new Tile('S', 1)},
        {x: 7, y: 6, tile: new Tile('S', 1)}
      ];
      // set tiles
      board.setTile(7, 7, new Tile('A', 1));
      board.setTile(7, 8, new Tile('A', 1));
      board.setTile(7, 9, new Tile('A', 1));
      board.setTile(8, 7, new Tile('A', 1));
      board.setTile(9, 7, new Tile('A', 1));
      // check move
      var result = board.isValidMove(move);
      assert.equal(result.success, true);
      assert.equal(result.message, 'BOARD_MOVE_OK');
      assert.equal(result.direction, 'y');
    });

    it('should be invalid to y direction if missing tile from the board', function () {
      var board = new Board();
      var move = [
        {x: 7, y: 14, tile: new Tile('S', 1)},
        {x: 7, y: 5, tile: new Tile('S', 1)},
        {x: 7, y: 6, tile: new Tile('S', 1)}
      ];
      // set tiles
      board.setTile(7, 7, new Tile('A', 1));
      board.setTile(7, 8, new Tile('A', 1));
      board.setTile(7, 9, new Tile('A', 1));
      board.setTile(8, 7, new Tile('A', 1));
      board.setTile(9, 7, new Tile('A', 1));
      // check move
      var result = board.isValidMove(move);
      assert.equal(result.success, false);
      assert.equal(result.message, 'BOARD_MOVE_TILES_ARE_DISCONNECTED');
      assert.equal(result.direction, 'y');
    });

    it('should be invalid move if blank is not selected', function () {
      var board = new Board();
      var move = [
        {x: 7, y: 10, tile: new Tile('?', 0)}
      ];
      // set tiles
      board.setTile(7, 7, new Tile('A', 1));
      board.setTile(7, 8, new Tile('A', 1));
      board.setTile(7, 9, new Tile('A', 1));
      board.setTile(8, 7, new Tile('A', 1));
      board.setTile(9, 7, new Tile('A', 1));
      // check move
      var result = board.isValidMove(move);
      assert.equal(result.success, false);
      assert.equal(result.message, 'BOARD_MOVE_BLANK_IS_NOT_SELECTED');
    });

    it('should be valid move if blank is selected', function () {
      var board = new Board();
      var move = [
        {x: 7, y: 10, tile: new Tile('B', 0)}
      ];
      // set tiles
      board.setTile(7, 7, new Tile('A', 1));
      board.setTile(7, 8, new Tile('A', 1));
      board.setTile(7, 9, new Tile('A', 1));
      board.setTile(8, 7, new Tile('A', 1));
      board.setTile(9, 7, new Tile('A', 1));
      // check move
      var result = board.isValidMove(move);
      assert.equal(result.success, true);
      assert.equal(result.message, 'BOARD_MOVE_OK');
    });
  });

  describe('#makeMove', function () {
    var board = new Board();

    it('should not place letters on the board if move is invalid', function () {
      var board = new Board();
      var move = [
        {x: 6, y: 8, tile: new Tile('S', 1)}
      ];
      // set tiles

      // check move
      var result = board.makeMove(move);
      assert.equal(result.success, false);
      assert.equal(result.direction, 'x');
      assert.equal(result.move.length, move.length);
      assert.equal(board.getTile(6, 8), null);
    });

    it('should be valid to x direction', function () {
      var board = new Board();
      var move = [
        {x: 6, y: 8, tile: new Tile('S', 1)},
        {x: 8, y: 8, tile: new Tile('S', 1)},
        {x: 5, y: 8, tile: new Tile('S', 1)}
      ];
      // set tiles
      board.setTile(7, 7, new Tile('A', 1));
      board.setTile(7, 8, new Tile('A', 1));
      board.setTile(7, 9, new Tile('A', 1));
      board.setTile(8, 7, new Tile('A', 1));
      board.setTile(9, 7, new Tile('A', 1));
      // check move
      var result = board.makeMove(move);
      assert.equal(result.success, true);
      assert.equal(result.message, 'BOARD_MOVE_OK');
      assert.equal(result.direction, 'x');
      assert.equal(result.move.length, move.length);
      assert.deepEqual(board.getTile(6, 8), move[0].tile);
      assert.deepEqual(board.getTile(6, 8), { letter: 'S', value: 1 });
    });

    it('should be valid to y direction', function () {
      var board = new Board();
      var move = [
        {x: 7, y: 10, tile: new Tile('S', 1)},
        {x: 7, y: 5, tile: new Tile('S', 1)},
        {x: 7, y: 6, tile: new Tile('S', 1)}
      ];
      // set tiles
      board.setTile(7, 7, new Tile('A', 1));
      board.setTile(7, 8, new Tile('A', 1));
      board.setTile(7, 9, new Tile('A', 1));
      board.setTile(8, 7, new Tile('A', 1));
      board.setTile(9, 7, new Tile('A', 1));
      // check move
      var result = board.makeMove(move);
      assert.equal(result.success, true);
      assert.equal(result.message, 'BOARD_MOVE_OK');
      assert.equal(result.direction, 'y');
      assert.equal(result.move.length, move.length);
    });
  });
});
