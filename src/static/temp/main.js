var $ = require('jquery');

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
