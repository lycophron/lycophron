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
    allWords = [],
    i,
    j,
    k,
    decodedLetter = '',
    decodedWord = '';

  for (i = 2; i <= 15; i += 1) {
    lines = this.getNLetterWords(i).solution;
    for (j = 0; j < lines.length; j += 1) {
      //ines[j] = this.dictionary.decode(lines[j]);
      allWords.push(this.dictionary.decode(lines[j]).toUpperCase());
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
      return a.localeCompare(b);
    });
    console.log(i, lines.length);
    allWords = allWords.LUnique();
    fs.writeFileSync(path.join(this.directory, 'WordList_' + i + '.csv'), lines.join(',\n'));
  }

  allWords.sort(function (a, b) {
    return a.localeCompare(b);
  });

  fs.writeFileSync(path.join(this.directory, 'WordList.csv'), allWords.join('\n'));
}

module.exports = CSVDumper;
