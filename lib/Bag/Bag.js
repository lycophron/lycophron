'use strict';

var utils = require('../utils');
var chance = utils.chance;
var debug = require('debug');
var q = require('q');
var Tile = require('./Tile');

var LETTER_DISTRIBUTIONS = require('./LetterDistributions');

var DRAWING_METHOD = {
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

  this.deferred = q.defer();

  this.initialize();
}

Bag.prototype.initialize = function () {
  var self = this;
  this.logger('initializing');

  if (LETTER_DISTRIBUTIONS.has(this.langCode) === false) {
    throw new RangeError('Language code "' + this.langCode + '" was not found in: ' +
      Array.from(LETTER_DISTRIBUTIONS.keys()).join(', '));
  }

  var language = LETTER_DISTRIBUTIONS.get(this.langCode);

  if (language.has(this.bagType) === false) {
    throw new RangeError('Bag type "' + this.bagType + '" was not found in: ' +
      Object.keys(language).join(', '));
  }

  this.logger('Language code bag type: ' + this.langCode + ', ' + this.bagType);

  var letterDistribution = language.get(this.bagType);
  var i;

  this.origianalTiles = [];

  for (i = 0; i < letterDistribution.size; i += 1) {
    var thisDistribution = letterDistribution.get(i);
    var j;
    for (j = 0; j < thisDistribution.get('count'); j += 1) {
      this.origianalTiles.push(new Tile(thisDistribution.get('letter'), thisDistribution.get('value')));
    }
  }

  this.logger('added ' + this.origianalTiles.length + ' letters');
  this.tiles = this.origianalTiles.slice();

  this.dictionary.ready()
    .then(function () {
      // encode Bag
      for (var k = 0; k < self.origianalTiles.length; k += 1) {
        self.origianalTiles[k].letter = self.dictionary.encode([self.origianalTiles[k].letter]);
      }
      self.deferred.resolve();
    })
    .catch(function (err) {
      throw err;
    });
}

Bag.prototype.ready = function () {
  return this.deferred.promise;
};

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

  var selectedTile;
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
  // console.log('Selected Tile:', selectedTile);
  var before = this.tiles.length;
  var idx;
  for (var i = 0; i < this.tiles.length; i += 1) {
    if (this.tiles[i].letter === selectedTile.letter) {
      idx = i;
    }
  }
  this.tiles.splice(idx, 1);
  var after = this.tiles.length;
  if (before !== after + 1) {
    console.error(' ERROR ------------- ', this.tiles.length, selectedTile);
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
