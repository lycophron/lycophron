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

function Bag(langCode, bagType, dictionary, id) {
  this.id = id || utils.getId();
  this.logger = debug('lycophron:bag:' + this.id);
  this.logger('ctor');

  this.langCode = langCode;
  this.bagType = bagType;
  this.dictionary = dictionary;

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
      this.origianalTiles.push(new Tile(thisDistribution.get('letter'), thisDistribution.get('value')));
    }
  }

  // encode Bag
  for (var k = 0; k < this.origianalTiles.length; k += 1) {
    this.origianalTiles[k].letter = this.dictionary.encode([this.origianalTiles[k].letter]);
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

Bag.prototype.getVowel = function (drawingMethod) {
  var self = this;
  var vowels = this.tiles.filter(function (t) { return self.dictionary.isVowel(t.letter); });
  var selectedTile;

  if (vowels.length > 0) {
    selectedTile = this.getTile(drawingMethod, vowels);
  }

  return selectedTile;
}

Bag.prototype.getConsonant = function (drawingMethod) {
  var self = this;
  var consonants = this.tiles.filter(function (t) { return self.dictionary.isConsonant(t.letter); });
  var selectedTile;

  if (consonants.length > 0) {
    selectedTile = this.getTile(drawingMethod, consonants);
  }

  return selectedTile;
}

Bag.prototype.getTile = function (drawingMethod, tilesArray) {
  this.logger('getting a tile');

  tilesArray = tilesArray || this.tiles;

  if (tilesArray.length === 0) {
    this.logger('empty');
    return;
  }

  if (typeof drawingMethod === 'undefined') {
    // if not defined use RANDOM by default
    drawingMethod = DRAWING_METHOD.RANDOM;
  }

  let selectedTile;
  if (isDrawingMethod(drawingMethod, DRAWING_METHOD.RANDOM)) {
    selectedTile = chance.pick(tilesArray);

  } else if (isDrawingMethod(drawingMethod, DRAWING_METHOD.FROM_BEGGINING)) {
    selectedTile = tilesArray[0];

  } else if (isDrawingMethod(drawingMethod, DRAWING_METHOD.FROM_END)) {
    selectedTile = tilesArray[tilesArray.length - 1];

  } else {
    throw new Error('Unsupported drawing method: "' + drawingMethod + '" use one of the following: ' +
      Object.keys(DRAWING_METHOD).join(', '));
  }

  this.tiles.splice(this.tiles.indexOf(selectedTile), 1);


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
