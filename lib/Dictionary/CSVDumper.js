'use strict';

var Dictionary = require('./Dictionary');

var CONSTANTS = require('../Constants');
var path = require('path');
var fs = require('fs');

function CSVDumper(dictFilename) {
  this.directory = path.dirname(dictFilename);
  this.dict = require(dictFilename);
  this.dictionary = new Dictionary(this.dict);
}

CSVDumper.prototype.getNLetterWords = function (n) {
  return this.dictionary.getSolutionForProblem(new Array( n + 1 ).join( CONSTANTS.BLANK ), new RegExp('^.{' + n +'}$'));
}

CSVDumper.prototype.generateCSVFile = function () {
  var lines = [],
    i,
    j,
    k,
    decodedLetter = '',
    decodedWord = '';

  for (i = 2; i <= 15; i += 1) {
    lines = this.getNLetterWords(i).solution;
    for (j = 0; j < lines.length; j += 1) {
      //ines[j] = this.dictionary.decode(lines[j]);
      decodedWord = '';
      for (k = 0; k < lines[j].length; k += 1) {
        decodedLetter = this.dictionary.decode(lines[j][k]);
        if (decodedLetter.length > 1) {
          decodedWord += decodedLetter.toUpperCase();
        } else {
          decodedWord += decodedLetter;
        }
      }
      lines[j] = decodedWord;
    }
    lines.sort(function (a, b) {
      return a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase());
    });
    console.log(i, lines.length);
    fs.writeFileSync(path.join(this.directory, 'WordList_' + i + '.csv'), lines.join(',\n'));
  }
}

module.exports = CSVDumper;
