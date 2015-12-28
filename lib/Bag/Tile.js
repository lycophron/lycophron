'use strict';

var CONSTANTS = require('../Constants');

var Tile = function (letter, value) {
  this.letter = letter;
  this.value = value;
};

Tile.prototype.isBlank = function () {
  return this.value === 0;
};

Tile.prototype.setBlank = function (letter) {
  if (this.isBlank()) {
    this.letter = letter;
  }
};

Tile.prototype.clearBlank = function () {
  if (this.isBlank()) {
    this.letter = CONSTANTS.BLANK;
  }
};

Tile.prototype.print = function () {
  return this.letter + this.value;
};

Tile.prototype.toJSON = function () {
  return {
    letter: this.letter,
    value: this.value
  };
};

module.exports = Tile;
