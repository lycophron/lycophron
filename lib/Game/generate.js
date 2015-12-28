'use strict';

var fs = require('fs');
var GameGenerator = require('./GameGenerator');

var gameGenerator = new GameGenerator();

// var generatedGame = gameGenerator.generateGame('hu', 'standard', 'me2003', 'REGULAR');
// var generatedGame = gameGenerator.generateGame('hu', 'standard', 'me2003', 'SQUARE');
var generatedGame = gameGenerator.generateGame('en', 'standard', 'WL2014', 'SQUARE');

if (generatedGame) {
  fs.writeFileSync(generatedGame.id + '.json', JSON.stringify(generatedGame, null, 2));
}
