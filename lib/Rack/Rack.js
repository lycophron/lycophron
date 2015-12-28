'use strict';

var utils = require('../utils');

var Rack = function () {
  this.tiles = [];
};

Rack.prototype.shuffle = function () {
  this.tiles = utils.chance.shuffle(this.tiles);
};

Rack.prototype.sort = function (compareFn) {
  this.tiles.sort(compareFn);
};

Rack.prototype.clear = function () {
  this.tiles = [];
};

Rack.prototype.addTile = function (tile) {
  this.tiles.push(tile);
};

Rack.prototype.removeTile = function (tile) {
  var index = this.tiles.indexOf(tile);

  if (index === -1) {
    for (var i = 0; i < this.tiles.length; i += 1) {
      if (tile.isBlank() && this.tiles[i].isBlank()) {
        index = i;
        break;
      } else if (tile.letter === this.tiles[i].letter) {
        index = i;
        break;
      }
    }
  }
  if (index > -1) {
    this.tiles.splice(index, 1);
  }
};

Rack.prototype.getTiles = function () {
  return this.tiles;
};

module.exports = Rack;
