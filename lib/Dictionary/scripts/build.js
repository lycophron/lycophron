'use strict';

var ENCODING = require('../Encoding');
require('../../ArrayExtensions');

var directoryNames = ['en', 'hu'];
var dirGlobPattern = '@(' + directoryNames.join('|') + ')';
var suffix = '.dict.txt';

// read through selected directories
var glob = require('glob');
var fs = require('fs');
var path = require('path');
var winston = require('winston');

var logger = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({
                colorize: true,
                timestamp: true,
                prettyPrint: true
            }),
            new (winston.transports.File)({
                filename: 'update_dictionaries.log',
                json: false
            })
        ]
    });

var options = {
        nocase: true
    };

function normalize(word) {
    return word.toLocaleLowerCase();
}

function encodeWord(word, encodeMap) {
    var i,
        j,
        k,
        currentLetter,
        currentEncodedLetter,
        doubleLetter,
        tripleLetter,
        currentEncodedDoubleLetter,
        currentEncodedTripleLetter,
        encodedWords = [],
        doubleLetterWords = [],
        tripleLetterWords = [],
        result = [];

    encodedWords.push('');

    for (i = 0; i < word.length; i += 1) {
        currentLetter = word[i];

        if (encodeMap.has(currentLetter)) {
            currentEncodedLetter = encodeMap.get(currentLetter);
        } else {
            currentEncodedLetter = currentLetter;
        }

        if (i < word.length - 1) {
            doubleLetter = currentLetter + word[i + 1];
            if (encodeMap.has(doubleLetter)) {
                currentEncodedDoubleLetter = encodeMap.get(doubleLetter);
            } else {
                currentEncodedDoubleLetter = '';
            }
        }

        if (i < word.length - 2) {
            tripleLetter = currentLetter + word[i + 1] + word[i + 2];
            if (encodeMap.has(tripleLetter)) {
                currentEncodedTripleLetter = encodeMap.get(tripleLetter);
            } else {
                currentEncodedTripleLetter = '';
            }
        }

        for (j = 0; j < encodedWords.length; j += 1) {
            if (currentEncodedTripleLetter) {
                if (!tripleLetterWords[i + 3]) {
                    tripleLetterWords[i + 3] = [];
                }
                tripleLetterWords[i + 3].push(encodedWords[j] + currentEncodedTripleLetter);
            }
            if (currentEncodedDoubleLetter) {
                if (!doubleLetterWords[i + 2]) {
                    doubleLetterWords[i + 2] = [];
                }
                doubleLetterWords[i + 2].push(encodedWords[j] + currentEncodedDoubleLetter);
            }
            encodedWords[j] = encodedWords[j] + currentEncodedLetter;
        }

        for (j = 0; j < doubleLetterWords.length; j += 1) {

            if (j === i + 1) {
                if (doubleLetterWords[j]) {
                    for (k = 0; k < doubleLetterWords[j].length; k += 1) {
                        encodedWords.push(doubleLetterWords[j][k]);
                    }
                }
            }
        }

        for (j = 0; j < tripleLetterWords.length; j += 1) {
            if (j === i + 1) {
                if (tripleLetterWords[j]) {
                    for (k = 0; k < tripleLetterWords[j].length; k += 1) {
                        encodedWords.push(tripleLetterWords[j][k]);
                    }
                }
            }
        }
    }

    for (i = 0; i < encodedWords.length; i += 1) {
      if (encodedWords[i].length > 1) {
        // include only words that have more than one character
        result.push(encodedWords[i]);
      }
    }

    return result;
};



function processWords(filename) {
  var words = fs.readFileSync(filename).toString().split('\n');
  words = words.LUnique();
  logger.info('Processing ' + words.length + ' words ...');

  var fname = path.basename(filename);
  var language = path.basename(path.dirname(filename));
  var name = fname.slice(0, fname.indexOf(suffix));
  var dictFilename = name + '.json';
  var result = {
    source: path.join(language, fname),
    language: language,
    name: name,
    numWords: 0,
    numUniqueWords: 0,
    dict: path.join(language, dictFilename)
  };
  var dict = {
          language: language,
          name: name,
          numWords: 0,
          numUniqueWords: 0,
          encodeMap: {},
          decodeMap: {},
          root: {}
      };

  var i;
  var j;
  var k;
  var key;
  var value;
  var shouldSkip;
  var normalized;
  var encodedWords;
  var encodedWord;
  var sortedEncodedWord;
  var letter;
  var node = dict.root;
  var skipped = [];

  var isConsonant = ENCODING.get(language).get('isConsonant');
  var isVowel = ENCODING.get(language).get('isVowel');
  var encodeMap = ENCODING.get(language).get('encodeMap');

  dict.encodeMap = encodeMap.toJSON();

  for (key in dict.encodeMap) {
      if (dict.encodeMap.hasOwnProperty(key)) {
          value = dict.encodeMap[key];
          if (dict.decodeMap[value]) {
              throw new Error('Ambiguous key/value: ' + key + ' ' + value + ' current value ' + dict.decodeMap[value]);
          }
          dict.decodeMap[value] = key;
      }
  }

  for (i = 0; i < words.length; i += 1) {
      // encode the word, then split letters to an array and sort them alphabetically.

      shouldSkip = false;
      words[i] = words[i].trim().toLowerCase();
      normalized = normalize(words[i]);

      for (j = 0; j < normalized.length; j += 1) {
          if ((isConsonant(normalized[j]) ||
           isVowel(normalized[j])) === false) {
              shouldSkip = true;
              break;
          }
      }

      if (shouldSkip) {
          skipped.push(words[i]);
          continue;
      }

      encodedWords = encodeWord(normalized, encodeMap);

      for (j = 0; j < encodedWords.length; j += 1) {
          encodedWord = encodedWords[j];
          sortedEncodedWord = encodedWord.split('').sort();

          for (k = 0; k < sortedEncodedWord.length; k += 1) {
              letter = sortedEncodedWord[k];

              if (node.hasOwnProperty(letter) === false) {
                  node[letter] = {};
              }
              node = node[letter];
          }

          if (!node._) {
              node._ = [];
          }

          node._.push(encodedWord);

          //console.log(sortedEncodedWord, encodedWord, node._, node.$);

          node = dict.root;

          dict.numWords += 1;
      }

      dict.numUniqueWords += 1;
  }

  if (skipped.length) {
    logger.warn(skipped.length + ' words were skipped.');    logger.warn('Skipped words: ' + skipped.join(', '));
  }

  result.numWords = dict.numWords;
  result.numUniqueWords = dict.numUniqueWords;


  fs.writeFileSync(path.join(path.dirname(filename), dictFilename), JSON.stringify(dict));


  logger.info(result);

  logger.info('Done.');
  return result;
};

logger.info('Searching for word lists ... ');
glob(path.join(__dirname, '..', dirGlobPattern, '*' + suffix), options, function (err, files) {
  if (err) {
    logger.error(err);
    return;
  }
  var i;
  var info;
  var dictionaries = [];

  for (i = 0; i < files.length; i += 1) {
    logger.info('Found: ' + files[i]);
    info = processWords(files[i]);
    dictionaries.push(info);
  }

  // generate an index file
  fs.writeFileSync(path.join(__dirname, '..', 'info.json'), JSON.stringify(dictionaries, null, 2));
});
