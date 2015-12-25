'use strict';

var Dictionary = require('./Dictionary');

var Bag = require('../Bag/Bag');
var CONSTANTS = require('../Constants');
var path = require('path');
var fs = require('fs');

function CheatSheet(dictFilename) {
  this.directory = path.dirname(dictFilename);
  this.dict = require(dictFilename);
  this.dictionary = new Dictionary(this.dict);
  this.bag = new Bag(this.dictionary.getLanguageCode(), 'standard');
}

CheatSheet.prototype.getNLetterWords = function (n) {
  return this.dictionary.getSolutionForProblem(new Array( n + 1 ).join( CONSTANTS.BLANK ), new RegExp('^.{' + n +'}$'));
}

CheatSheet.prototype.get2LetterWords = function () {
  return this.getNLetterWords(2);
}

CheatSheet.prototype.get3LetterWords = function () {
  return this.getNLetterWords(3);
}

CheatSheet.prototype.getWords = function (contains, minLength, maxLength) {
  var patterns = [
    new RegExp('^(.*' + contains + '.*)$', 'g'),
    new RegExp('^.{' + minLength + ',' + maxLength + '}$', 'g'),
  ];
  return this.dictionary.getSolutionForProblem(new Array( maxLength + 1 ).join( CONSTANTS.BLANK ), contains);
}

CheatSheet.prototype.getHooks = function (numLetters) {
  numLetters = numLetters || 2;
  var allSolutions = this.dictionary.getSolutionForProblem(new Array( numLetters + 1 ).join( CONSTANTS.BLANK ));
  var words = allSolutions.byLength[numLetters];
  var word;
  var result = {};
  var i;
  var j;

  for (i = 0; i < words.length; i += 1) {
    word = words[i];
    var thisResult = {
      preHooks: [],
      postHooks: []
    };
    result[word.d] = thisResult;

    // TODO: factor this out
    var hookedWords = this.dictionary.getSolutionForProblem(word.e + '?').byLength[numLetters + 1];
    if (hookedWords) {
      var prefixRegexp = new RegExp('^' + '.' + word.e + '$');
      var suffixRegexp = new RegExp('^' + word.e + '.' + '$');
      var hookedWord;
      for (j = 0; j < hookedWords.length; j += 1) {
        hookedWord = hookedWords[j];
        if (prefixRegexp.test(hookedWord.e)) {
          thisResult.preHooks.push(this.dictionary.decode(hookedWord.e[0]));
        } else if (suffixRegexp.test(hookedWord.e)) {
          thisResult.postHooks.push(this.dictionary.decode(hookedWord.e[hookedWord.e.length - 1]));
        }
      }

      thisResult.preHooks.sort(function (a, b) { return a.localeCompare(b); });
      thisResult.postHooks.sort(function (a, b) { return a.localeCompare(b); });
    }
  }

  return result;
}

CheatSheet.prototype.prettyPrintHooks = function (hooks) {
  var lines = [];
  var word;
  var i;
  var maxPreHookLength = 0;

  // prints in a formatted way
  var keys = Object.keys(hooks).sort(function (a, b) { return a.toUpperCase().localeCompare(b.toUpperCase()); });

  for (i = 0; i < keys.length; i += 1) {
    word = keys[i];
    if (hooks.hasOwnProperty(word)) {
      if (hooks[word].preHooks.join(' ').length > maxPreHookLength) {
        maxPreHookLength = hooks[word].preHooks.join(' ').length;
      }
    }
  }

  for (i = 0; i < keys.length; i += 1) {
    word = keys[i];
    if (hooks.hasOwnProperty(word)) {
      var r = hooks[word];
      lines.push(new Array(maxPreHookLength - r.preHooks.join(' ').length + 1).join(' ') + r.preHooks.join(' ') + '  ' + word.toUpperCase() + '  ' + r.postHooks.join(' '));
    }
  }
  return lines;
}

CheatSheet.prototype.getWordsForLetter = function (letter, minLength, maxLength) {
  // TODO: precheck arguments

  var solutions = this.dictionary.getSolutionForProblem(new Array( maxLength + 1 ).join( CONSTANTS.BLANK ));
  var i;
  var j;

  var result = [];
  var partialResult;
  var solution;
  var thisElement;
  var encodedLetter = this.dictionary.encode([letter.toLowerCase()]);

  for (i = minLength; i <= maxLength; i += 1) {
    if (solutions.byLength.hasOwnProperty(i)) {
      solution = solutions.byLength[i];
      partialResult = [];

      for (j = 0; j < solution.length; j += 1) {
        thisElement = solution[j];
        if (thisElement.e.indexOf(encodedLetter) > -1) {
          partialResult.push(thisElement.d);
        }
      }
      partialResult.sort(function (a, b) { return a.localeCompare(b); });

      result = result.concat(partialResult);
    }
  }

  //console.log(result.join(', '));
  return result;
}

CheatSheet.prototype.getShortWordsWithInFrequentTiles = function () {
  var self = this;
  var letters = [];
  var result = {};
  var i;
  var letter;

  for (i = 0; i < this.bag.origianalTiles.length; i += 1) {
      if (this.bag.origianalTiles[i].get('count') === 1) {
        letters.push(this.dictionary.encode([this.bag.origianalTiles[i].get('letter')]));
      }
  }

  letters.sort(function (a, b) {
      return self.dictionary.decode(a).localeCompare(self.dictionary.decode(b));
  });

  for (i = 0; i < letters.length; i += 1) {
    letter = letters[i];
    result[letter] = this.getWordsForLetter(self.dictionary.decode(letter), 2, 4);
    // console.log('Short ' + self.dictionary.decode(letter).toUpperCase() + ' words');
    // console.log(result[letter].map(function (a) {
    //   return a.toUpperCase();
    // }).join(', '));
  }

  return result;
}

CheatSheet.prototype.getVowelDumps = function () {
  var self = this;
  return this.getDumps(2, 7, function (word, encodedWord) {
    var stat = self.dictionary.countVowelsAndConsonants(word);
    if (encodedWord.length < 4) {
      // no consonants
      return stat.numConsonants === 0;
    } else {
      // only one or zero consonants
      return stat.numConsonants <= 1;
    }
  });
}

CheatSheet.prototype.getConsonantDumps = function () {
  var self = this;
  return this.getDumps(2, 7, function (word, encodedWord) {
    var stat = self.dictionary.countVowelsAndConsonants(word);
    if (encodedWord.length < 5) {
      // no vowels
      return stat.numVowels === 0;
    } else {
      // only one or zero vowel
      return stat.numVowels <= 1;
    }
  });
}

CheatSheet.prototype.getDumps = function (minLength, maxLength, fn) {
  var solutions = this.dictionary.getSolutionForProblem(new Array( maxLength + 1 ).join( CONSTANTS.BLANK ));
  var i;
  var j;

  var result = [];
  var partialResult;
  var solution;
  var thisElement;

  for (i = minLength; i <= maxLength; i += 1) {
    if (solutions.byLength.hasOwnProperty(i)) {
      solution = solutions.byLength[i];
      partialResult = [];

      solution = solution.filter(function (obj) {
        return fn(obj.d, obj.e);
      });
      for (j = 0; j < solution.length; j += 1) {
        thisElement = solution[j];
        partialResult.push(thisElement.d);
      }
      partialResult.sort(function (a, b) { return a.localeCompare(b); });

      result = result.concat(partialResult);
    }
  }

  return result;
}

CheatSheet.prototype.getXLetterMakingXplus1 = function (length, minWords, numTopResults) {
  var result = {};
  var nLetterWords = this.getNLetterWords(length);
  var i;
  var alphagram;
  var xPlusOneSolution;

  minWords = minWords || 1;
  numTopResults = numTopResults || 0;

  var len = nLetterWords.solution.length;

  for (i = 0; i < len; i += 1) {
    if (i % 100 === 0) {
      console.log(i);
    }
    alphagram = nLetterWords.solution[i];
    alphagram = alphagram.split('').LSortAlphabetically().join('');
    if (result.hasOwnProperty(alphagram) === false) {
      xPlusOneSolution = this.dictionary.getSolutionForProblem(alphagram + CONSTANTS.BLANK);

      if (xPlusOneSolution.byLength[length + 1] &&
        xPlusOneSolution.byLength[length + 1].length >= minWords) {
        result[alphagram] = {
          alphagram: alphagram,
          word: nLetterWords.solution[i],
          words: xPlusOneSolution.byLength[length + 1]
        }
      }
    }
  }

  var results = Object.keys(result).map(function(key) {
    return result[key];
  });
  results.sort(function (a, b) { return b.words.length - a.words.length; });

  if (numTopResults > 0) {
    if (results.length > numTopResults) {
      results = results.slice(0, numTopResults);
    }
  }

  return results;
}

CheatSheet.prototype.getXLetterAlphagrams = function (length, numTopResults) {
  var result = {};
  var nLetterWords = this.getNLetterWords(length);
  var i;
  var alphagram;
  var alphagramSolution;

  numTopResults = numTopResults || 0;

  var len = nLetterWords.solution.length;

  for (i = 0; i < len; i += 1) {
    if (i % 100 === 0) {
      console.log(i);
    }
    alphagram = nLetterWords.solution[i];
    alphagram = alphagram.split('').LSortAlphabetically().join('');
    if (result.hasOwnProperty(alphagram) === false) {
      alphagramSolution = this.dictionary.getSolutionForProblem(alphagram);
      if (alphagramSolution.byLength[length].length > 1) {
        result[alphagram] = {
          alphagram: alphagram,
          word: nLetterWords.solution[i],
          words: alphagramSolution.byLength[length]
        }
      }
    }
  }

  var results = Object.keys(result).map(function(key) {
    return result[key];
  });
  results.sort(function (a, b) { return b.words.length - a.words.length; });
  if (numTopResults > 0) {
    if (results.length > numTopResults) {
      results = results.slice(0, numTopResults);
    }
  }

  return results;
}

CheatSheet.prototype.prettyPrintAlphagrams = function (alphagrams) {
  var i,
      thisResult,
      result = [];

  for (i = 0; i < alphagrams.length; i += 1) {
    thisResult = alphagrams[i];
    result.push(this.dictionary.decodeArray(thisResult.alphagram.split('')).join(' ').toUpperCase() + ' [ ' +
  thisResult.words.map(function (value) { return value.d.toUpperCase(); }).join(', ') + ' ]');
  }

  return result;
}

CheatSheet.prototype.harvest = function () {
  return {
    twoLetterWords: this.get2LetterWords(),
    threeLetterWords: this.get3LetterWords(),
    vowelDumps: this.getVowelDumps(),
    consonantDumps: this.getConsonantDumps(),
    shortWordsWithInFrequentTiles: this.getShortWordsWithInFrequentTiles()
  };
}

CheatSheet.prototype.generateTextFiles = function () {
  var sheets = this.harvest();

  var lines = [
    this.prettyPrintSolution('2-letter words', sheets.twoLetterWords),
    this.prettyPrintSolution('3-letter words', sheets.threeLetterWords)
  ];

  lines.push('2-Letter Words and Their Hooks');
  lines.push(this.prettyPrintHooks(this.getHooks(2)).join('\n'));

  var shortWordsWithInFrequentTilesLines = [];

  for (var letter in sheets.shortWordsWithInFrequentTiles) {
    if (sheets.shortWordsWithInFrequentTiles.hasOwnProperty(letter)) {
      lines.push(this.prettyPrintList(
        'Short ' + this.dictionary.decode(letter).toUpperCase() + ' words',
        sheets.shortWordsWithInFrequentTiles[letter])
      );
    }
  }

  lines = lines.concat([
    this.prettyPrintList('Vowel Dumps', sheets.vowelDumps),
    this.prettyPrintList('Consonant Dumps', sheets.consonantDumps),
  ]);

  lines.push('3-Letter Words and Their Hooks');
  lines.push(this.prettyPrintHooks(this.getHooks(3)).join('\n'));

  lines.push('6-letters + ' + CONSTANTS.BLANK);
  lines.push(this.prettyPrintAlphagrams(this.getXLetterMakingXplus1(6, 1)).join('\n'));

  lines.push('7-letter alphagrams');
  lines.push(this.prettyPrintAlphagrams(this.getXLetterAlphagrams(7)).join('\n'));

  lines.push('8-letter alphagrams');
  lines.push(this.prettyPrintAlphagrams(this.getXLetterAlphagrams(8)).join('\n'));

  fs.writeFileSync(path.join(this.directory, 'CheatSheet.txt'), lines.join('\n\n'));
}

CheatSheet.prototype.prettyPrintSolution = function (title, words) {
  var key,
      i,
      group,
      results = [];

  for (key in words.byLength) {
    group = words.byLength[key];
    for (i = 0; i < group.length; i += 1) {
      results.push(group[i].d.toUpperCase());
    }
  }

  results.LSortAlphabetically();

  return this.prettyPrintList(title, results);
}

CheatSheet.prototype.prettyPrintList = function (title, words) {
  // print list nicely
  var length = words.length;
  var nn = Math.floor(Math.sqrt(words.length));
  var columns = Math.min(nn, 14);
  var rows = Math.floor(words.length / columns) + 1;
  var line;
  var idx;
  var idx2;
  var i;
  var j;
  var k;
  var padding;
  var maxLengthPerColumn = new Array(columns + 1);
  var maxLength;
  var lines = [];

  lines.push(title);

  for (i = 0; i < rows; i += 1) {
    line = [];

    for (j = 0; j <= columns; j += 1) {
      idx = i + j * rows;

      if (i === 0) {
        // get the maximum length in this column
        maxLengthPerColumn[j] = 0;
        for (k = 0; k <= rows; k += 1) {
          idx2 = Math.min(j * rows + k, words.length - 1);
          if (maxLengthPerColumn[j] < words[idx2].length) {
            maxLengthPerColumn[j] = words[idx2].length;
          }
        }
      }

      maxLength = maxLengthPerColumn[j];

      if (idx < words.length) {
        padding = (new Array(Math.max(maxLength + 2 - words[idx].length, 1)).join(' '));
        line.push(words[idx].toUpperCase() + padding);
      }
    }
    lines.push(line.join(' '));
  }

  return lines.join('\n');
}

module.exports = CheatSheet;
