'use strict';

var utils = require('../utils');
var chance = utils.chance;
var debug = require('debug');
var Tile = require('./Tile');

const LETTER_DISTRIBUTIONS = require('./LetterDistributions');

const DRAWING_METHOD = {
  RANDOM: 0,
  FROM_BEGGINING: 1,
  FROM_END: 2
};

function isDrawingMethod(drawingMethod, methodToCheck) {
  if (drawingMethod === methodToCheck) {
    return true;
  } else {
    if (DRAWING_METHOD.hasOwnProperty(drawingMethod) && DRAWING_METHOD[drawingMethod] === methodToCheck) {
       return true;
     } else {
       return false;
     }
  }
}

function Bag(langCode, bagType, id) {
  this.id = id || utils.getId();
  this.logger = debug('lycophron:bag:' + this.id);
  this.logger('ctor');

  this.langCode = langCode;
  this.bagType = bagType;

  this.initialize();
}

Bag.prototype.initialize = function () {
  this.logger('initializing');

  if (LETTER_DISTRIBUTIONS.has(this.langCode) === false) {
    throw new RangeError('Language code "' + this.langCode + '" was not found in: ' +
      Array.from(LETTER_DISTRIBUTIONS.keys()).join(', '));
  }

  let language = LETTER_DISTRIBUTIONS.get(this.langCode);

  if (language.has(this.bagType) === false) {
    throw new RangeError('Bag type "' + this.bagType + '" was not found in: ' +
      Object.keys(language).join(', '));
  }

  this.logger('Language code bag type: ' + this.langCode + ', ' + this.bagType);

  let letterDistribution = language.get(this.bagType);
  let i;

  this.origianalTiles = [];

  for (i = 0; i < letterDistribution.size; i += 1) {
    let thisDistribution = letterDistribution.get(i);
    let j;
    for (j = 0; j < thisDistribution.get('count'); j += 1) {
      // TODO: create a new tile
      this.origianalTiles.push(new Tile(thisDistribution.letter, thisDistribution.value));
    }
  }

  this.logger('added ' + this.origianalTiles.length + ' letters');
  this.tiles = this.origianalTiles.slice();
  chance.shuffle(this.tiles);
}

Bag.prototype.getSize = function () {
  return this.origianalTiles.length;
}

Bag.prototype.getNumRemainingTiles = function () {
  return this.tiles.length;
}


Bag.prototype.getTile = function (drawingMethod) {
  this.logger('getting a tile');

  if (this.tiles.length === 0) {
    this.logger('empty');
    return;
  }

  if (typeof drawingMethod === 'undefined') {
    // if not defined use RANDOM by default
    drawingMethod = DRAWING_METHOD.RANDOM;
  }

  let selectedTile;
  if (isDrawingMethod(drawingMethod, DRAWING_METHOD.RANDOM)) {
    selectedTile = chance.pick(this.tiles);
    this.tiles.splice(this.tiles.indexOf(selectedTile), 1);

  } else if (isDrawingMethod(drawingMethod, DRAWING_METHOD.FROM_BEGGINING)) {
    selectedTile = this.tiles.shift();

  } else if (isDrawingMethod(drawingMethod, DRAWING_METHOD.FROM_END)) {
    selectedTile = this.tiles.pop();

  } else {
    throw new Error('Unsupported drawing method: "' + drawingMethod + '" use one of the following: ' +
      Object.keys(DRAWING_METHOD).join(', '));
  }

  this.logger('got tile: ' + selectedTile);
  return selectedTile;
}

Bag.prototype.putTileBack = function (tile, shuffle) {
  this.logger('put tile back');

  if (this.origianalTiles.indexOf(tile) === -1) {
    throw new RangeError('Given tile was not part of this bag.');
  }

  shuffle = !!shuffle; // default true

  this.tiles.push(tile);

  if (shuffle) {
    chance.shuffle(this.tiles);
  }
}

module.exports = Bag;
