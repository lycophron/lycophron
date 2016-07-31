'use strict';

var Dictionary = require('./Dictionary');

var Bag = require('../Bag/Bag');
var CONSTANTS = require('../Constants');
var path = require('path');
var fs = require('fs');

function CSVDumper(dictFilename) {
  this.directory = path.dirname(dictFilename);
  this.dict = require(dictFilename);
  this.dictionary = new Dictionary(this.dict);
  this.bag = new Bag(this.dictionary.getLanguageCode(), 'standard', this.dictionary);
}

CSVDumper.prototype.getNLetterWords = function (n) {
  return this.dictionary.getSolutionForProblem(new Array( n + 1 ).join( CONSTANTS.BLANK ), new RegExp('^.{' + n +'}$'));
}

CSVDumper.prototype.generateCSVFile = function () {
  var self = this,
    lines = [],
    allWords = [],
    i,
    j,
    k,
    decodedLetter = '',
    decodedWord = '';

  function softFunction(a, b) {
    var i,
      j,
      possibleIdx,
      idxA,
      idxB,
      result = 0;

    for (i = 0, j = 0; i < a.length && j < b.length; i += 1, j += 1) {
      idxA = self.bag.blankSelection.indexOf(a[i]);
      if (i < a.length - 1) {
        possibleIdx = self.bag.blankSelection.indexOf(a[i] + a[i + 1]);
        if (possibleIdx > -1) {
          idxA = possibleIdx;
          i += 1;
        }
      }

      idxB = self.bag.blankSelection.indexOf(b[j]);
      if (j < b.length - 1) {
        possibleIdx = self.bag.blankSelection.indexOf(b[j] + b[j + 1]);
        if (possibleIdx > -1) {
          idxB = possibleIdx;
          j += 1;
        }
      }

      if (idxA !== idxB) {
        result = idxA > idxB ? 1 : -1;
        // if (a === 'ad') {
        //   console.log(a, b, i, j, idxA, idxB, result);
        // }
        break;
      }
    }

    if (result === 0) {
      if (a.length > b.length) {
        result = 1;
      } else if (a.length < b.length) {
        result = -1;
      } else {
        result = 0;
      }
    }

    // console.log(result);
    return result;
  };

  for (i = 2; i <= 15; i += 1) {
    lines = this.getNLetterWords(i).solution;
    for (j = 0; j < lines.length; j += 1) {
      //ines[j] = this.dictionary.decode(lines[j]);
      allWords.push(this.dictionary.decode(lines[j]));
      decodedWord = '';
      for (k = 0; k < lines[j].length; k += 1) {
        decodedLetter = this.dictionary.decode(lines[j][k]);
        if (decodedLetter.length > 1) {
          decodedWord += decodedLetter;
        } else {
          decodedWord += decodedLetter;
        }
      }
      lines[j] = decodedWord;
    }
    lines.sort(softFunction);
    console.log(i, lines.length);
    allWords = allWords.LUnique();
    fs.writeFileSync(path.join(this.directory, 'WordList_' + i + '.csv'), lines.join('\n'));
  }

  allWords.sort(softFunction);

  fs.writeFileSync(path.join(this.directory, 'WordList.csv'), allWords.join('\n'));

  // console.log(this.bag.blankSelection);
}

module.exports = CSVDumper;
