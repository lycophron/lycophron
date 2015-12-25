'use strict';

var utils = require('../utils');
var chance = utils.chance;
var Immutable = utils.Immutable;
var debug = require('debug');
require('../ArrayExtensions');

var ENCODING = require('./Encoding');
var CONSTANTS = require('../Constants');

function Dictionary(dict, id) {
  this.id = id || utils.getId();
  this.logger = debug('lycophron:dictionary:' + this.id);
  this.logger('ctor');

  this.dict = dict;
  this.encoding = ENCODING.get(this.getLanguageCode());

  this.initialize();
};

Dictionary.prototype.initialize = function () {
  this.logger('initializing');

};

Dictionary.prototype.getLanguageCode = function () {
  return this.dict.language;
};

Dictionary.prototype.encode = function (letters) {
    var self = this,
        result = '',
        letter,
        i;

    for (i = 0; i < letters.length; i += 1) {
        letter = letters[i];
        result += self.dict.encodeMap[letter] || letter;
    }

    return result;
};

Dictionary.prototype.countVowelsAndConsonants = function (word) {
  var result = {
    numVowels: 0,
    numConsonants: 0
  };
  var i;
  var letter;
  var decodedLetter;

  for (i = 0; i < word.length; i += 1) {
    letter = word[i];
    decodedLetter = this.decode(letter);
    if (this.encoding.get('isConsonant')(decodedLetter)) {
      result.numConsonants += 1;
    } else if (this.encoding.get('isVowel')(decodedLetter)) {
      result.numVowels += 1;
    } else {
      throw new Error('Not a consonant nor a vowel. ' + letter + ' in ' + word);
    }
  }

  return result;
}

Dictionary.prototype.decode = function (letters) {
    var self = this,
        result = '',
        letter,
        i;

    for (i = 0; i < letters.length; i += 1) {
        letter = letters[i];
        result += self.dict.decodeMap[letter] || letter;
    }

    return result;
};

Dictionary.prototype.decodeArray = function (letters) {
    var self = this,
        result = [],
        letter,
        i;

    for (i = 0; i < letters.length; i += 1) {
        letter = letters[i];
        result.push(self.dict.decodeMap[letter] || letter);
    }

    return result;
};

Dictionary.prototype.checkWord = function (encodedWord) {
  var words = this.getAllWordsForAnagram(encodedWord, true);
  var exists = words.indexOf(encodedWord) > -1;
  return exists;
};

Dictionary.prototype.getAllWordsForAnagram = function (encodedAnagram, exactMatch) {
    var letters = encodedAnagram.split('').LSort(),
        key = letters.join(''),
        words;

    //if (exactMatch) {
    //    if (this.anagramCacheExactMatch[key] !== undefined) {
    //        return this.anagramCacheExactMatch[key];
    //    }
    //} else {
    //    if (this.anagramCacheAll[key] !== undefined) {
    //        return this.anagramCacheAll[key];
    //    }
    //}

    words = this.getSubWords(letters, exactMatch);
    words = words.LUnique();
    //words = mysortLengthAlphabetical(words);
    words.LSortByLength();

    //if (exactMatch) {
    //    this.anagramCacheExactMatch[key] = words;
    //} else {
    //    this.anagramCacheAll[key] = words;
    //}

    return words;
};

Dictionary.prototype.countBlanks = function (letters) {
    var numBlanks = 0,
        len;

    len = letters.length;

    while (len--) {
        if (letters[len] === CONSTANTS.BLANK) {
            numBlanks += 1;
        }
    }
    return numBlanks;
};

Dictionary.prototype.getSubWords = function (subword, exactMatch, node, letters, numBlanks, usedBlanks) {
    var results = [],

        nextLetter,
        nodeLetters,

        i,
        key,

        letter,
        nextSubword;

    letters = letters || '';
    numBlanks = numBlanks || this.countBlanks(subword);
    usedBlanks = usedBlanks || 0;

    if (!subword ||
        (subword.length === 0 &&
        usedBlanks === numBlanks)) {
        return results;
    }

    if (!node) {
        node = this.dict.root;

        // strip blanks
        subword = subword.filter(function (i) {
            return i !== CONSTANTS.BLANK;
        });
    }

    nextLetter = subword.length > 1 ? subword[1] : CONSTANTS.BLANK; // last letter in dictionary

    if (usedBlanks < numBlanks) {
        // use one joker
        nodeLetters = Object.keys(node).sort();
        // ASSUMPTION: nodelLetters are sorted alphabetically
        for (i = 0; i < nodeLetters.length; i += 1) {
            key = nodeLetters[i];
            if (key !== '_') {
                results = results.concat(this.getSubWords(subword, exactMatch, node[key], letters + key, numBlanks, usedBlanks + 1));
                if (node[key]._ !== undefined) {
                    results = results.concat(node[key]._);
                }

                if (key === nextLetter) {
                    break;
                }
            }
        }
    }

    letter = subword[0];
    if (letter) {
        // exclude current letter
        nextSubword = subword.slice(1, subword.length);

        // take
        if (node[letter] !== undefined) {
            results = results.concat(this.getSubWords(nextSubword, exactMatch, node[letter], letters + letter, numBlanks, usedBlanks));
            if (node[letter]._ !== undefined) {
                results = results.concat(node[letter]._);
            }
        }

        if (node._ !== undefined) {
            results = results.concat(node._);
        }

        if (!exactMatch) {
            // skip is allowed
            results = results.concat(this.getSubWords(nextSubword, exactMatch, node, letters, numBlanks, usedBlanks));
        }
    }

    return results;
};


Dictionary.prototype.getSolutionForProblem = function (letters, patterns) {
    var self = this,
        solution = self.getAllWordsForAnagram(letters),
        key,
        i,
        results = {
            problemId: letters.split('').sort().join('')
        };

    results.problem = self.decodeArray(results.problemId.split(''));
    results.problem.LSortAlphabetically();
    results.solution = solution;

    if (patterns) {
      results.solution = results.solution.filter(function (value) {
        var result = true;
        if (patterns.length) {
          for (var i = 0; i < patterns.length && result; i += 1) {
            result = result && patterns[i].test(value);
          }
        } else {
          result = patterns.test(value);
        }
        return result;
      });
    }

    //results.lang = self.lang;
    //results.typeName = self.typeName;

    results.byLength = {};

    for (i = 0; i < results.solution.length; i += 1) {
        key = results.solution[i].length;
        if (!results.byLength[key]) {
            results.byLength[key] = [];
        }
        results.byLength[key].push({
            e: solution[i],
            d: self.decode(results.solution[i])
        });
    }

    return results;
};

module.exports = Dictionary;
