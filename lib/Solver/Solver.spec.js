'use strict';

var assert = require('assert');
var Score = require('../Score/Score');
var Board = require('../Board/Board');
var Bag = require('../Bag/Bag');
var Rack = require('../Rack/Rack');
var Tile = require('../Bag/Tile');
var CONSTANTS = require('../Constants');

var Solver = require('../Solver/Solver');

var Dictionary = require('../Dictionary/Dictionary');
var fs = require('fs');
var dict = JSON.parse(fs.readFileSync(__dirname + '/../Dictionary/en/WL2014.json'));
var dictionary = new Dictionary(dict);
var bag = new Bag('en', 'standard', dictionary);

var dictHu = JSON.parse(fs.readFileSync(__dirname + '/../Dictionary/hu/me2003.json'));
var dictionaryHu = new Dictionary(dictHu);
var bagHu = new Bag('en', 'standard', dictionaryHu);

describe('Solver', function () {
  it.skip('should find all solutions with multiple blanks for empty board', function () {
    var board = new Board();
    var score = new Score(board, dictionary);
    var rack = new Rack();
    var solver = new Solver(board, score, dictionary);
    // setup board
    // set rack
    rack.addTile(new Tile('m', 1));
    rack.addTile(new Tile('m', 1));
    rack.addTile(new Tile('m', 1));
    rack.addTile(new Tile(CONSTANTS.BLANK, 0));
    rack.addTile(new Tile(CONSTANTS.BLANK, 0));
    rack.addTile(new Tile(CONSTANTS.BLANK, 0));

    var solutions = solver.solve(rack);

    solutions = solutions.filter(function (s) { return s.word === 'mmm' && s.x === 7; });
    console.log(solutions);
    // mmm, mm?, m?m, ?mm, ??m, ?m?, m??, ???
    assert.equal(solutions.length, 8);
    assert.equal(solutions[0].x, 7);
    assert.equal(solutions[0].y, 7);
    assert.equal(solutions[0].word, 'mmm');

    // console.log(board.printBoard().join('\n'));
  });

  it.skip('should find multiple solutions with multiple blanks used for empty board', function () {
    var board = new Board();
    var score = new Score(board, dictionary);
    var rack = new Rack();
    var solver = new Solver(board, score, dictionary);
    // setup board
    // set rack
    rack.addTile(new Tile('m', 1));
    rack.addTile(new Tile('a', 1));
    rack.addTile(new Tile('a', 1));
    rack.addTile(new Tile(CONSTANTS.BLANK, 0));
    rack.addTile(new Tile(CONSTANTS.BLANK, 0));
    rack.addTile(new Tile(CONSTANTS.BLANK, 0));

    var solutions = solver.solve(rack);

    solutions = solutions.filter(function (s) { return s.word === 'mmm' && s.x === 7; });
    console.log(solutions);
    // ??m, ?m?, m??
    assert.equal(solutions.length, 3);
    assert.equal(solutions[0].x, 7);
    assert.equal(solutions[0].y, 7);
    assert.equal(solutions[0].word, 'mmm');

    // console.log(board.printBoard().join('\n'));
  });

  it('should find words with blank for empty board', function () {
    var board = new Board();
    var score = new Score(board, dictionary);
    var rack = new Rack();
    var solver = new Solver(board, score, dictionary);
    // setup board
    // set rack
    rack.addTile(new Tile(CONSTANTS.BLANK, 0));
    rack.addTile(new Tile(CONSTANTS.BLANK, 0));

    var solutions = solver.solve(rack);
    assert.equal(solutions.length, 211);
    assert.equal(solutions[0].x, 6);
    assert.equal(solutions[0].y, 7);
    assert.equal(solutions[0].word, 'aa');
    assert.equal(solutions[1].x, 6);
    assert.equal(solutions[1].y, 7);
    assert.equal(solutions[1].word, 'ab');

    // console.log(board.printBoard().join('\n'));
  });

  it('should find words with blank if it is already set for empty board', function () {
    var board = new Board();
    var score = new Score(board, dictionary);
    var rack = new Rack();
    var solver = new Solver(board, score, dictionary);
    // setup board
    // set rack
    rack.addTile(new Tile('z', 0));
    rack.addTile(new Tile('z', 0));

    var solutions = solver.solve(rack);
    assert.equal(solutions.length, 211);
    assert.equal(solutions[0].x, 6);
    assert.equal(solutions[0].y, 7);
    assert.equal(solutions[0].word, 'aa');
    assert.equal(solutions[1].x, 6);
    assert.equal(solutions[1].y, 7);
    assert.equal(solutions[1].word, 'ab');

    // console.log(board.printBoard().join('\n'));
  });

  it('should find words for empty board', function () {
    var board = new Board();
    var score = new Score(board, dictionary);
    var rack = new Rack();
    var solver = new Solver(board, score, dictionary);
    // setup board
    // set rack
    rack.addTile(new Tile('a', 1));
    rack.addTile(new Tile('a', 1));
    rack.addTile(new Tile('h', 3));

    var solutions = solver.solve(rack);
    // aah x3, aha x3, ah x2, ha x2, aa x2, empty
    assert.equal(solutions.length, 13);
    assert.equal(solutions[0].x, 5);
    assert.equal(solutions[0].y, 7);
    assert.equal(solutions[0].word, 'aah');
    assert.equal(solutions[1].x, 5);
    assert.equal(solutions[1].y, 7);
    assert.equal(solutions[1].word, 'aha');
    assert.equal(solutions[2].x, 6);
    assert.equal(solutions[2].y, 7);
    assert.equal(solutions[2].word, 'aah');
    // console.log(board.printBoard().join('\n'));
  });

  it('should return with empty solution', function () {
    var board = new Board();
    var score = new Score(board, dictionary);
    var rack = new Rack();
    var solver = new Solver(board, score, dictionary);
    // setup board
    // set rack
    rack.addTile(new Tile('a', 1));

    var solutions = solver.solve(rack);
    assert.equal(solutions.length, 1);
    assert.equal(solutions[0].score, 0);
    assert.deepEqual(solutions[0].move, []);

    // console.log(board.printBoard().join('\n'));
  });

  it('should return with empty solution for zxk', function () {
    var board = new Board();
    var score = new Score(board, dictionary);
    var rack = new Rack();
    var solver = new Solver(board, score, dictionary);
    // setup board
    // set rack
    rack.addTile(new Tile('z', 10));
    rack.addTile(new Tile('x', 8));
    rack.addTile(new Tile('k', 5));

    var solutions = solver.solve(rack);
    assert.equal(solutions.length, 1);
    assert.equal(solutions[0].score, 0);
    assert.deepEqual(solutions[0].move, []);

    // console.log(board.printBoard().join('\n'));
  });

  describe('hu', function () {
    it('should find solutions with w, x, dzs', function () {
      var board = new Board();
      var score = new Score(board, dictionaryHu);
      var rack = new Rack();
      var solver = new Solver(board, score, dictionaryHu);
      // setup board
      // set rack
      rack.addTile(new Tile(CONSTANTS.BLANK, 0));
      rack.addTile(new Tile('c', 3));
      rack.addTile(new Tile('e', 1));
      rack.addTile(new Tile('m', 1));

      var solutions = solver.solve(rack);
      var x = solutions.filter(function (s) { return s.word && s.word.indexOf('x') > -1; });
      var w = solutions.filter(function (s) { return s.word && s.word.indexOf('w') > -1; });
      var dzs = solutions.filter(function (s) { return s.word && s.word.indexOf('P') > -1; });
      // console.log(x, w, dzs);
      assert.equal(x.length, 2);
      assert.equal(w.length, 2);
      assert.equal(dzs.length, 3);
    });
  });

  describe.skip('performance tests', function () {
    it('should find solutions for performance test', function () {
      this.timeout(20000);
      var board = new Board();
      var score = new Score(board, dictionary);
      var rack = new Rack();
      var solver = new Solver(board, score, dictionary);
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
      rack.addTile(new Tile(CONSTANTS.BLANK, 0));

      var solutions = solver.solve(rack);
      // console.log(solutions);
      // console.log(board.printBoard().join('\n'));
      assert.equal(solutions.length > 20, true);
      // board.makeMove(solutions[0].move);
      // console.log(board.printBoard().join('\n'));
    });

    it.skip('should find solutions NUMBER', function () {
      this.timeout(20000);
      var board = new Board();
      var score = new Score(board, dictionary);
      var rack = new Rack();
      var solver = new Solver(board, score, dictionary);
      // PLACEHOLDER

      var solutions = solver.solve(rack);
      // console.log(solutions);
      // console.log(board.printBoard().join('\n'));
      assert.equal(solutions.length > 20, true);
    });

    it('should find solutions 001', function () {
      this.timeout(8000);
      var board = new Board();
      var score = new Score(board, dictionary);
      var rack = new Rack();
      var solver = new Solver(board, score, dictionary);

      // Test information: 11627
      // set board
      board.setTile(2, 7, new Tile('l', 1));
      board.setTile(3, 7, new Tile('o', 1));
      board.setTile(3, 8, new Tile('d', 2));
      board.setTile(3, 9, new Tile('d', 2));
      board.setTile(3, 10, new Tile('m', 3));
      board.setTile(3, 11, new Tile('e', 1));
      board.setTile(3, 12, new Tile('n', 1));
      board.setTile(3, 13, new Tile('t', 1));
      board.setTile(3, 14, new Tile('s', 1));
      board.setTile(4, 7, new Tile('o', 1));
      board.setTile(4, 14, new Tile('l', 1));
      board.setTile(5, 7, new Tile('f', 4));
      board.setTile(5, 14, new Tile('u', 1));
      board.setTile(6, 7, new Tile('a', 1));
      board.setTile(6, 14, new Tile('r', 1));
      board.setTile(7, 0, new Tile('r', 1));
      board.setTile(7, 1, new Tile('e', 1));
      board.setTile(7, 2, new Tile('c', 3));
      board.setTile(7, 3, new Tile('e', 1));
      board.setTile(7, 4, new Tile('i', 1));
      board.setTile(7, 5, new Tile('p', 3));
      board.setTile(7, 6, new Tile('t', 1));
      board.setTile(7, 7, new Tile('s', 1));
      board.setTile(7, 14, new Tile('b', 3));
      board.setTile(8, 14, new Tile('a', 1));
      board.setTile(9, 14, new Tile('n', 1));
      // set rack
      rack.addTile(new Tile('o', 1));
      rack.addTile(new Tile('g', 2));
      rack.addTile(new Tile('n', 1));
      rack.addTile(new Tile('?', 0));
      rack.addTile(new Tile('i', 1));
      rack.addTile(new Tile('i', 1));
      rack.addTile(new Tile('a', 1));

      var solutions = solver.solve(rack);
      // console.log(solutions);
      // console.log(board.printBoard().join('\n'));
      assert.equal(solutions.length > 20, true);
      assert.equal(solutions[0].word, 'miaouing');
      assert.equal(solutions[0].score, 90);
    });

    it('should find solutions 002', function () {
      this.timeout(5000);
      var board = new Board();
      var score = new Score(board, dictionary);
      var rack = new Rack();
      var solver = new Solver(board, score, dictionary);

      // Test information: 998
      // set board
      board.setTile(0, 12, new Tile('g', 2));
      board.setTile(1, 12, new Tile('o', 1));
      board.setTile(2, 7, new Tile('l', 1));
      board.setTile(2, 12, new Tile('o', 1));
      board.setTile(3, 7, new Tile('o', 1));
      board.setTile(3, 8, new Tile('d', 2));
      board.setTile(3, 9, new Tile('d', 2));
      board.setTile(3, 10, new Tile('m', 3));
      board.setTile(3, 11, new Tile('e', 1));
      board.setTile(3, 12, new Tile('n', 1));
      board.setTile(3, 13, new Tile('t', 1));
      board.setTile(3, 14, new Tile('s', 1));
      board.setTile(4, 4, new Tile('c', 3));
      board.setTile(4, 7, new Tile('o', 1));
      board.setTile(4, 10, new Tile('i', 1));
      board.setTile(4, 12, new Tile('e', 1));
      board.setTile(4, 14, new Tile('l', 1));
      board.setTile(5, 1, new Tile('j', 8));
      board.setTile(5, 4, new Tile('u', 1));
      board.setTile(5, 7, new Tile('f', 4));
      board.setTile(5, 10, new Tile('a', 1));
      board.setTile(5, 12, new Tile('y', 4));
      board.setTile(5, 14, new Tile('u', 1));
      board.setTile(6, 1, new Tile('e', 1));
      board.setTile(6, 4, new Tile('b', 3));
      board.setTile(6, 7, new Tile('a', 1));
      board.setTile(6, 10, new Tile('o', 1));
      board.setTile(6, 14, new Tile('r', 1));
      board.setTile(7, 0, new Tile('r', 1));
      board.setTile(7, 1, new Tile('e', 1));
      board.setTile(7, 2, new Tile('c', 3));
      board.setTile(7, 3, new Tile('e', 1));
      board.setTile(7, 4, new Tile('i', 1));
      board.setTile(7, 5, new Tile('p', 3));
      board.setTile(7, 6, new Tile('t', 1));
      board.setTile(7, 7, new Tile('s', 1));
      board.setTile(7, 10, new Tile('u', 0));
      board.setTile(7, 14, new Tile('b', 3));
      board.setTile(8, 1, new Tile('p', 3));
      board.setTile(8, 4, new Tile('t', 1));
      board.setTile(8, 10, new Tile('i', 1));
      board.setTile(8, 13, new Tile('h', 4));
      board.setTile(8, 14, new Tile('a', 1));
      board.setTile(9, 1, new Tile('s', 1));
      board.setTile(9, 10, new Tile('n', 1));
      board.setTile(9, 13, new Tile('e', 1));
      board.setTile(9, 14, new Tile('n', 1));
      board.setTile(10, 10, new Tile('g', 2));
      board.setTile(10, 13, new Tile('l', 1));
      board.setTile(11, 13, new Tile('v', 4));
      board.setTile(12, 13, new Tile('e', 1));
      board.setTile(13, 13, new Tile('s', 1));
      // set rack
      rack.addTile(new Tile('a', 1));
      rack.addTile(new Tile('e', 1));
      rack.addTile(new Tile('f', 4));
      rack.addTile(new Tile('g', 2));
      rack.addTile(new Tile('e', 1));
      rack.addTile(new Tile('n', 1));
      rack.addTile(new Tile('a', 1));

      var solutions = solver.solve(rack);
      // console.log(solutions);
      // console.log(board.printBoard().join('\n'));
      assert.equal(solutions.length > 20, true);
      assert.equal(solutions[0].word, 'fenagle');
      assert.equal(solutions[0].score, 32);
    });

    it('should find solutions 003', function () {
      this.timeout(10000);
      var board = new Board();
      var score = new Score(board, dictionary);
      var rack = new Rack();
      var solver = new Solver(board, score, dictionary);

      assert.deepEqual(dictionary.getAllWordsForAnagram('aa'), ['aa']);
      assert.deepEqual(dictionary.getAllWordsForAnagram('ab'), ['ab', 'ba']);
      assert.deepEqual(dictionary.getAllWordsForAnagram('q?'), ['qi']);
      assert.equal(dictionary.getAllWordsForAnagram('??').length, 105); // 105 two letter words

      // Test information: 18858
      // set board
      board.setTile(0, 11, new Tile('w', 4));
      board.setTile(0, 12, new Tile('i', 1));
      board.setTile(0, 13, new Tile('l', 1));
      board.setTile(0, 14, new Tile('y', 4));
      board.setTile(1, 11, new Tile('i', 1));
      board.setTile(2, 9, new Tile('c', 3));
      board.setTile(2, 11, new Tile('v', 4));
      board.setTile(3, 9, new Tile('o', 1));
      board.setTile(3, 10, new Tile('w', 4));
      board.setTile(3, 11, new Tile('e', 1));
      board.setTile(4, 8, new Tile('p', 3));
      board.setTile(4, 9, new Tile('o', 1));
      board.setTile(4, 10, new Tile('i', 1));
      board.setTile(5, 8, new Tile('e', 1));
      board.setTile(5, 9, new Tile('f', 4));
      board.setTile(5, 10, new Tile('s', 1));
      board.setTile(5, 13, new Tile('y', 4));
      board.setTile(5, 14, new Tile('e', 1));
      board.setTile(6, 8, new Tile('n', 1));
      board.setTile(6, 10, new Tile('h', 4));
      board.setTile(6, 13, new Tile('a', 1));
      board.setTile(6, 14, new Tile('x', 8));
      board.setTile(7, 7, new Tile('u', 1));
      board.setTile(7, 8, new Tile('n', 1));
      board.setTile(7, 13, new Tile('u', 1));
      board.setTile(7, 14, new Tile('t', 1));
      board.setTile(8, 7, new Tile('p', 3));
      board.setTile(8, 8, new Tile('e', 1));
      board.setTile(8, 13, new Tile('d', 2));
      board.setTile(8, 14, new Tile('o', 1));
      board.setTile(9, 5, new Tile('q', 10));
      board.setTile(9, 6, new Tile('a', 1));
      board.setTile(9, 7, new Tile('t', 1));
      board.setTile(9, 14, new Tile('r', 1));
      board.setTile(10, 6, new Tile('m', 3));
      board.setTile(10, 7, new Tile('a', 1));
      board.setTile(10, 8, new Tile('j', 8));
      board.setTile(10, 9, new Tile('o', 1));
      board.setTile(10, 10, new Tile('r', 1));
      board.setTile(10, 11, new Tile('e', 1));
      board.setTile(10, 12, new Tile('d', 2));
      board.setTile(10, 14, new Tile('t', 1));
      board.setTile(11, 7, new Tile('k', 5));
      board.setTile(11, 11, new Tile('f', 4));
      board.setTile(11, 12, new Tile('a', 1));
      board.setTile(11, 13, new Tile('c', 3));
      board.setTile(11, 14, new Tile('e', 1));
      board.setTile(12, 2, new Tile('r', 1));
      board.setTile(12, 3, new Tile('e', 1));
      board.setTile(12, 4, new Tile('n', 1));
      board.setTile(12, 5, new Tile('e', 1));
      board.setTile(12, 6, new Tile('g', 2));
      board.setTile(12, 7, new Tile('e', 1));
      board.setTile(12, 8, new Tile('s', 1));
      board.setTile(12, 14, new Tile('d', 2));
      // set rack
      rack.addTile(new Tile('o', 1));
      rack.addTile(new Tile('i', 1));
      rack.addTile(new Tile('u', 1));
      rack.addTile(new Tile('t', 1));
      rack.addTile(new Tile('?', 0));
      rack.addTile(new Tile('z', 10));
      rack.addTile(new Tile('b', 3));

      var solutions = solver.solve(rack);
      // console.log(solutions);
      // console.log(board.printBoard().join('\n'));
      // console.log(dictionary.cntGetSubWord);
      // console.log(dictionary.cntGetOnlySolutionForProblem);
      assert.equal(solutions.length > 20, true);
      assert.equal(solutions[0].word, 'azimuth');
      assert.equal(solutions[0].score, 76);
    });

    it('should find solutions 004', function () {
      var board = new Board();
      var score = new Score(board, dictionary);
      var rack = new Rack();
      var solver = new Solver(board, score, dictionary);
      // Test information: 26247
      // set board
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

      var solutions = solver.solve(rack);
      // console.log(solutions);
      // console.log(board.printBoard().join('\n'));
      // console.log(dictionary.cntGetSubWord);
      // console.log(dictionary.cntGetOnlySolutionForProblem);
      assert.equal(solutions.length > 20, true);
    });
  });

  describe('x direction', function () {
    it('should find pre- and suffixes', function () {
      this.timeout(3000);
      var board = new Board();
      var score = new Score(board, dictionary);
      var rack = new Rack();
      var solver = new Solver(board, score, dictionary);
      // setup board
      board.setTile(4, 7, new Tile('h', 3));
      board.setTile(5, 7, new Tile('e', 1));
      board.setTile(6, 7, new Tile('a', 1));
      board.setTile(7, 7, new Tile('t', 1));
      // set rack
      rack.addTile(new Tile('d', 2));
      rack.addTile(new Tile('e', 1));
      rack.addTile(new Tile('p', 4));
      rack.addTile(new Tile('r', 1));
      rack.addTile(new Tile('e', 1));
      rack.addTile(new Tile('s', 1));

      var solutions = solver.solve(rack);
      solutions = solutions.filter(function (s) { return s.word === 'preheated' && s.y === 7; });
      assert.equal(solutions.length, 1);
      assert.equal(solutions[0].x, 1);
      board.makeMove(solutions[0].move);
      // console.log(board.printBoard().join('\n'));
    });

    it('should find if a single tile is placed', function () {
      var board = new Board();
      var score = new Score(board, dictionary);
      var rack = new Rack();
      var solver = new Solver(board, score, dictionary);
      // setup board
      board.setTile(7, 4, new Tile('h', 3));
      board.setTile(7, 5, new Tile('e', 1));
      board.setTile(7, 6, new Tile('a', 1));
      board.setTile(7, 7, new Tile('t', 1));
      // set rack
      rack.addTile(new Tile('s', 1));

      var solutions = solver.solve(rack);
      solutions = solutions.filter(function (s) { return s.direction === 'x'; });
      assert.equal(solutions.length, 3);
      assert.equal(solutions[0].x, 6);
      assert.equal(solutions[0].y, 4);
      assert.equal(solutions[0].word, 'sh');
      assert.equal(solutions[1].x, 7);
      assert.equal(solutions[1].y, 6);
      assert.equal(solutions[1].word, 'as');
      assert.equal(solutions[2].x, 7);
      assert.equal(solutions[2].y, 5);
      assert.equal(solutions[2].word, 'es');
      // board.makeMove(solutions[0].move);
      // console.log(board.printBoard().join('\n'));
    });

    it('should find if a single tile is placed and there are multiple ones in front of it', function () {
      var board = new Board();
      var score = new Score(board, dictionary);
      var rack = new Rack();
      var solver = new Solver(board, score, dictionary);
      // setup board
      board.setTile(7, 4, new Tile('h', 3));
      board.setTile(5, 5, new Tile('p', 4));
      board.setTile(6, 5, new Tile('e', 1));
      board.setTile(7, 5, new Tile('e', 1));
      board.setTile(7, 6, new Tile('a', 1));
      board.setTile(7, 7, new Tile('t', 1));
      // set rack
      rack.addTile(new Tile('s', 1));

      var solutions = solver.solve(rack);
      solutions = solutions.filter(function (s) { return s.direction === 'x'; });
      assert.equal(solutions.length, 2);
      assert.equal(solutions[0].x, 5);
      assert.equal(solutions[0].y, 5);
      assert.equal(solutions[0].word, 'pees');
      // board.makeMove(solutions[0].move);
      // console.log(board.printBoard().join('\n'));
    });

    it('should find if there are no crosswords', function () {
      var board = new Board();
      var score = new Score(board, dictionary);
      var rack = new Rack();
      var solver = new Solver(board, score, dictionary);
      // setup board
      board.setTile(14, 0, new Tile('c', 4));
      board.setTile(14, 1, new Tile('c', 4));
      board.setTile(14, 2, new Tile('c', 4));
      board.setTile(14, 3, new Tile('c', 4));
      board.setTile(14, 4, new Tile('c', 4));
      board.setTile(14, 5, new Tile('c', 4));
      board.setTile(14, 6, new Tile('x', 8));
      board.setTile(14, 8, new Tile('x', 8));
      board.setTile(14, 9, new Tile('c', 4));
      board.setTile(14, 10, new Tile('c', 4));
      board.setTile(14, 11, new Tile('c', 4));
      board.setTile(14, 12, new Tile('c', 4));
      board.setTile(14, 13, new Tile('c', 4));
      board.setTile(14, 14, new Tile('c', 4));

      board.setTile(13, 7, new Tile('c', 8));
      board.setTile(0, 6, new Tile('x', 8));
      board.setTile(0, 8, new Tile('x', 8));

      board.setTile(5, 7, new Tile('z', 10));
      board.setTile(7, 7, new Tile('p', 4));
      // set rack
      rack.addTile(new Tile('s', 1));
      rack.addTile(new Tile('a', 1));

      var solutions = solver.solve(rack);
      solutions = solutions.filter(function (s) { return s.direction === 'x'; });
      // console.log(solutions);
      // console.log(board.printBoard().join('\n'));
      assert.equal(solutions.length, 20);
      assert.equal(solutions[0].x, 5);
      assert.equal(solutions[0].y, 7);
      assert.equal(solutions[0].word, 'zaps');
      // board.makeMove(solutions[0].move);
      // console.log(board.printBoard().join('\n'));
    });
  });


  describe('y direction', function () {
    it('should find pre- and suffixes', function () {
      this.timeout(3000);
      var board = new Board();
      var score = new Score(board, dictionary);
      var rack = new Rack();
      var solver = new Solver(board, score, dictionary);
      // setup board
      board.setTile(7, 4, new Tile('h', 3));
      board.setTile(7, 5, new Tile('e', 1));
      board.setTile(7, 6, new Tile('a', 1));
      board.setTile(7, 7, new Tile('t', 1));
      // set rack
      rack.addTile(new Tile('d', 2));
      rack.addTile(new Tile('e', 1));
      rack.addTile(new Tile('p', 4));
      rack.addTile(new Tile('r', 1));
      rack.addTile(new Tile('e', 1));
      rack.addTile(new Tile('s', 1));

      var solutions = solver.solve(rack);
      solutions = solutions.filter(function (s) { return s.word === 'preheated' && s.x === 7; });
      // console.log(solutions);
      assert.equal(solutions.length, 1);
      assert.equal(solutions[0].y, 1);
      board.makeMove(solutions[0].move);
      // console.log(board.printBoard().join('\n'));
    });

    it('should find if a single tile is placed', function () {
      var board = new Board();
      var score = new Score(board, dictionary);
      var rack = new Rack();
      var solver = new Solver(board, score, dictionary);
      // setup board
      board.setTile(4, 7, new Tile('h', 3));
      board.setTile(5, 7, new Tile('e', 1));
      board.setTile(6, 7, new Tile('a', 1));
      board.setTile(7, 7, new Tile('t', 1));
      // set rack
      rack.addTile(new Tile('s', 1));

      var solutions = solver.solve(rack);
      solutions = solutions.filter(function (s) { return s.direction === 'y'; });
      assert.equal(solutions.length, 3);
      assert.equal(solutions[0].x, 4);
      assert.equal(solutions[0].y, 6);
      assert.equal(solutions[0].word, 'sh');
      assert.equal(solutions[1].x, 6);
      assert.equal(solutions[1].y, 7);
      assert.equal(solutions[1].word, 'as');
      assert.equal(solutions[2].x, 5);
      assert.equal(solutions[2].y, 7);
      assert.equal(solutions[2].word, 'es');
      // board.makeMove(solutions[0].move);
      // console.log(board.printBoard().join('\n'));
    });

    it('should find if a single tile is placed and there are multiple ones in front of it', function () {
      var board = new Board();
      var score = new Score(board, dictionary);
      var rack = new Rack();
      var solver = new Solver(board, score, dictionary);
      // setup board
      board.setTile(4, 7, new Tile('h', 3));
      board.setTile(5, 5, new Tile('p', 4));
      board.setTile(5, 6, new Tile('e', 1));
      board.setTile(5, 7, new Tile('e', 1));
      board.setTile(6, 7, new Tile('a', 1));
      board.setTile(7, 7, new Tile('t', 1));
      // set rack
      rack.addTile(new Tile('s', 1));

      var solutions = solver.solve(rack);
      solutions = solutions.filter(function (s) { return s.direction === 'y'; });
      assert.equal(solutions.length, 2);
      assert.equal(solutions[0].x, 5);
      assert.equal(solutions[0].y, 5);
      assert.equal(solutions[0].word, 'pees');
      // board.makeMove(solutions[0].move);
      // console.log(board.printBoard().join('\n'));
    });

    it('should find if there are no crosswords', function () {
      var board = new Board();
      var score = new Score(board, dictionary);
      var rack = new Rack();
      var solver = new Solver(board, score, dictionary);
      // setup board
      board.setTile(0, 14, new Tile('c', 4));
      board.setTile(1, 14, new Tile('c', 4));
      board.setTile(2, 14, new Tile('c', 4));
      board.setTile(3, 14, new Tile('c', 4));
      board.setTile(4, 14, new Tile('c', 4));
      board.setTile(5, 14, new Tile('c', 4));
      board.setTile(6, 14, new Tile('x', 8));
      board.setTile(8, 14, new Tile('x', 8));
      board.setTile(9, 14, new Tile('c', 4));
      board.setTile(10, 14, new Tile('c', 4));
      board.setTile(11, 14, new Tile('c', 4));
      board.setTile(12, 14, new Tile('c', 4));
      board.setTile(13, 14, new Tile('c', 4));
      board.setTile(14, 14, new Tile('c', 4));

      board.setTile(7, 13, new Tile('c', 8));
      board.setTile(6, 0, new Tile('x', 8));
      board.setTile(8, 0, new Tile('x', 8));

      board.setTile(7, 5, new Tile('z', 10));
      board.setTile(7, 7, new Tile('p', 4));
      // set rack
      rack.addTile(new Tile('s', 1));
      rack.addTile(new Tile('a', 1));

      var solutions = solver.solve(rack);
      solutions = solutions.filter(function (s) { return s.direction === 'y'; });
      assert.equal(solutions.length, 20);
      assert.equal(solutions[0].x, 7);
      assert.equal(solutions[0].y, 5);
      assert.equal(solutions[0].word, 'zaps');
      // board.makeMove(solutions[0].move);
      // console.log(board.printBoard().join('\n'));
    });
  });
});
