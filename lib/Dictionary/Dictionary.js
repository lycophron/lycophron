'use strict';

var utils = require('../utils');
var chance = utils.chance;
var Immutable = utils.Immutable;
var debug = require('debug');
var q = require('q');
var fs = require('fs');
var request = require('superagent');
require('../ArrayExtensions');

var ENCODING = require('./Encoding');
var CONSTANTS = require('../Constants');

function Dictionary(dict, id) {
  var self = this;
  this.id = id || utils.getId();
  this.logger = debug('lycophron:dictionary:' + this.id);
  this.logger('ctor');

  this.cntGetSubWord = 0;
  this.cntGetOnlySolutionForProblem = 0;

  // this.anagramCacheAll = {};
  // this.anagramCacheExactMatch = {};


  this.deferred = q.defer();

  if (typeof dict === 'string') {
    if (typeof window === 'undefined') {
      // nodejs
      this.dict = JSON.parse(fs.readFileSync(__dirname + '/' + dict));
      this.initialize();
      this.deferred.resolve();
    } else {
      // browser
      request
        .get('/Dictionary/' + dict)
        .on('progress', function (value) {
          if (value.percentage) {
            console.log(dict, value.percentage);
          }
        })
        .end(function(err, res){
          // Do something
          // console.error(err);
          // console.log(res);
          if (err) {
            self.deferred.reject(err);
          } else {
            self.dict = res.body;
            self.initialize();
            self.deferred.resolve();
          }
        });
    }
  } else {
    this.dict = dict; // we have to make a copy
    this.initialize();
    this.deferred.resolve();
  }
};

Dictionary.prototype.initialize = function () {
  this.logger('initializing');
  this.encoding = ENCODING.get(this.getLanguageCode());

  this.updateDict();
};

Dictionary.prototype.updateDict = function () {
  // this.dict = JSON.parse(JSON.stringify(this.dict)); // we have to make a copy
  if (typeof this.dict.root.$$keys === 'undefined') {
    this.updateNode(this.dict.root);
  }
  // console.log(this.dict.root);
};

Dictionary.prototype.updateNode = function (node) {
  var keys = Object.keys(node);
  keys = keys.LFilter(function (k) { return k !== '_'; });
  keys.LSort();

  node.$$keys = keys;
  node.$$values = new Array(keys.length);

  for (var i = 0; i < keys.length; i += 1) {
    var n = node[keys[i]];
    node.$$values[i] = node[keys[i]];
    this.updateNode(n);
  }
};


Dictionary.prototype.ready = function () {
  return this.deferred.promise;
};

Dictionary.prototype.getLanguageCode = function () {
  return this.dict.language;
};

Dictionary.prototype.isConsonant = function (letter) {
  return this.encoding.get('isConsonant')(this.decode([letter]));
};

Dictionary.prototype.isVowel = function (letter) {
  return this.encoding.get('isVowel')(this.decode([letter]));
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

Dictionary.prototype.getAllWordsForAnagram = function (encodedAnagram, exactMatch, possibleBlanks_) {
  var possibleBlanks = possibleBlanks_ || [];

    var letters = encodedAnagram.split('').LSort(),
        key = letters.join(''),
        words;

    // if (exactMatch) {
    //    if (typeof this.anagramCacheExactMatch[key] !== 'undefined') {
    //        return this.anagramCacheExactMatch[key];
    //    }
    // } else {
    //    if (typeof this.anagramCacheAll[key] !== 'undefined') {
    //        return this.anagramCacheAll[key];
    //    }
    // }
    possibleBlanks.LSort();
    words = this.getSubWords(letters, exactMatch, null, null, null, null, possibleBlanks);
    // console.log(words.length);
    // console.log(words);
    words = words.LUnique();
    // console.log(words.length);
    //words = mysortLengthAlphabetical(words);
    words.LSortByLength();

    // if (exactMatch) {
    //    this.anagramCacheExactMatch[key] = words;
    // } else {
    //    this.anagramCacheAll[key] = words;
    // }

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


function done(subword, usedBlanks, numBlanks) {
  return (!subword ||
      (subword.length === 0 &&
      usedBlanks === numBlanks));
}

function stripBlanks(subword) {
  return subword.LFilter(function (i) {
      return i !== CONSTANTS.BLANK;
  });
}

Dictionary.prototype.blankSubWords = function (subword, exactMatch, node, letters, numBlanks, usedBlanks, nextLetter, possibleBlanks_) {
  var possibleBlanks = possibleBlanks_ || [];

  var results = [];
  var nodeLetters;
  var i;
  var key;
  var lastIteration = false;

  // ASSUMPTION: nodelLetters are sorted alphabetically
  for (i = 0; i < node.$$keys.length; i += 1) {
      key = node.$$keys[i];
      if (possibleBlanks.length > 0) {
        var idx = possibleBlanks.indexOf(key);
        if (idx === -1) {
          // console.log('skip');
          continue;
        } else if (idx === possibleBlanks.length - 1) {
          // console.log('no need to iterate more');
          lastIteration = true;
        }
      }

      var nk = node.$$values[i];

      results = results.LConcat(this.getSubWords(subword, exactMatch, nk, letters + key, numBlanks, usedBlanks + 1, possibleBlanks));
      if (typeof nk._ !== 'undefined') {
          results = results.LConcat(nk._);
      }

      if (key === nextLetter || lastIteration) {
          break;
      }
  }

  return results;
};

Dictionary.prototype.getSubWords = function (subword_, exactMatch_, node, letters_, numBlanks_, usedBlanks_, possibleBlanks_) {
  var possibleBlanks = possibleBlanks_ || [];

    var results = [],
        resultFragments = [],
        // size = 0,

        nextLetter,
        nodeLetters,

        letters,
        numBlanks,
        usedBlanks,
        exactMatch,
        subword,

        i,
        key,

        letter,
        nextSubword;

    this.cntGetSubWord += 1;

    subword = subword_;

    if (!subword) {
        return results;
    }

    letters = letters_ || '';
    numBlanks = numBlanks_ || this.countBlanks(subword);
    usedBlanks = usedBlanks_ || 0;
    exactMatch = exactMatch_ === true;

    if (done(subword, usedBlanks, numBlanks)) {
        return results;
    }

    // console.log(subword);

    if (!node) {
        node = this.dict.root;

        // strip blanks
        subword = stripBlanks(subword);
    }

    if (usedBlanks < numBlanks) {
        nextLetter = subword.length > 1 ? subword[1] : CONSTANTS.BLANK; // last letter in dictionary

        // use one blank
        // results = results.LConcat(this.blankSubWords(subword, exactMatch, node, letters, numBlanks, usedBlanks, nextLetter));
        resultFragments.push(this.blankSubWords(subword, exactMatch, node, letters, numBlanks, usedBlanks, nextLetter, possibleBlanks));
        // size += resultFragments[resultFragments.length - 1];
    }

    letter = subword[0];
    if (letter) {
        // exclude current letter
        nextSubword = subword.LForClone();
        nextSubword.shift();

        // take
        var idx = node.$$keys.indexOf(letter);
        if (idx > -1) {
          var nl = node.$$values[idx];
          // results = results.LConcat(this.getSubWords(nextSubword, exactMatch, nl, letters + letter, numBlanks, usedBlanks));
          resultFragments.push(this.getSubWords(nextSubword, exactMatch, nl, letters + letter, numBlanks, usedBlanks, possibleBlanks));
          // size += resultFragments[resultFragments.length - 1];

          if (typeof nl._ !== 'undefined') {
            resultFragments.push(nl._);
            // size += resultFragments[resultFragments.length - 1];

              // results = results.LConcat(nl._);
          }
        }

        if (!exactMatch) {
            // skip is allowed
            // results = results.LConcat(this.getSubWords(nextSubword, exactMatch, node, letters, numBlanks, usedBlanks));
            resultFragments.push(this.getSubWords(nextSubword, exactMatch, node, letters, numBlanks, usedBlanks, possibleBlanks));
            // size += resultFragments[resultFragments.length - 1];

        }
    }

    results = [];
    var len1 = resultFragments.length;
    for (var i = 0; i < len1; i += 1) {
      var len2 = resultFragments[i].length;
      for (var j = 0; j < len2; j += 1) {
        results.push(resultFragments[i][j]);
      }
    }

    return results;
};

Dictionary.prototype.getOnlySolutionForProblem = function (letters, patterns, possibleBlanks_) {
  var possibleBlanks = possibleBlanks_ || [];

  var self = this,
      solution = self.getAllWordsForAnagram(letters, false, possibleBlanks),
      key,
      i;

  this.cntGetOnlySolutionForProblem += 1;

  if (patterns) {
    solution = solution.LFilter(function (value) {
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

  return solution;
};

Dictionary.prototype.getSolutionForProblem = function (letters, patterns, possibleBlanks_) {
  var possibleBlanks = possibleBlanks_ || [];
    var self = this,
        solution = self.getOnlySolutionForProblem(letters, patterns, possibleBlanks),
        key,
        i,
        results = {
            problemId: letters.split('').LSort().join('')
        };

    results.problem = self.decodeArray(results.problemId.split(''));
    results.problem.LSortAlphabetically();
    results.solution = solution;

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
