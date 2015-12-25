'use strict';

var assert = require('assert');
var Tile = require('./Tile');

describe('Tile', function() {
  it('should handle blank', function () {
    var tile = new Tile('S', 0);
    assert.equal(tile.isBlank(), true);
    var tile2 = new Tile('S', 1);
    assert.equal(tile2.isBlank(), false);
  });

  it('should print tile', function () {
    var tile = new Tile('S', 1);
    assert.equal(tile.print().indexOf('S'), 0);
  });
});
