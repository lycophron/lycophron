'use strict';

var fs = require('fs');
var GameGenerator = require('./GameGenerator');

var gameGenerator = new GameGenerator();

gameGenerator.on('progress', function (value) {
  console.log(value + '%');
});

// var generatedGame = gameGenerator.generateGame('hu', 'standard', 'me2003', 'REGULAR');
// var generatedGame = gameGenerator.generateGame('hu', 'standard', 'me2003', 'SQUARE');
var generatedGameDeferred = gameGenerator.generateGame('en', 'standard', 'WL2014', 'SQUARE');

generatedGameDeferred
  .then(function (generatedGame) {
    if (generatedGame) {
      fs.writeFileSync(generatedGame.id + '.json', JSON.stringify(generatedGame, null, 2));
    }
  })
  .catch(console.error);
