'use strict';

var assert = require('assert');
var GameGenerator = require('./GameGenerator');

describe('GameGenerator', function() {

  it.skip('should generate games', function (done) {
    var gameGenerator = new GameGenerator();
    var generatedGameDeferred = gameGenerator.generateGame('en', 'standard', 'WL2014', 'SQUARE');

    generatedGameDeferred
      .then(function (generatedGame) {
        if (generatedGame) {

        }
      })
      .nodeify(done);
  });
});
