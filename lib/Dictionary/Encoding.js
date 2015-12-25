'use strict';

var utils = require('../utils');
var Immutable = utils.Immutable;
const CONSTANTS = require('../Constants');

module.exports = Immutable.Map({

  // English
  en: Immutable.Map({
    isConsonant: function (letter) {
      return (letter === 'b') ||
          (letter === 'c') ||
          (letter === 'd') ||
          (letter === 'f') ||
          (letter === 'g') ||
          (letter === 'h') ||
          (letter === 'j') ||
          (letter === 'k') ||
          (letter === 'l') ||
          (letter === 'm') ||
          (letter === 'n') ||
          (letter === 'p') ||
          (letter === 'q') ||
          (letter === 'r') ||
          (letter === 's') ||
          (letter === 't') ||
          (letter === 'v') ||
          (letter === 'w') ||
          (letter === 'x') ||
          (letter === 'y') ||
          (letter === 'z');
    },
    isVowel: function (letter) {
      return (letter === CONSTANTS.BLANK) ||
          (letter === 'a') ||
          (letter === 'e') ||
          (letter === 'i') ||
          (letter === 'o') ||
          (letter === 'u');
    },
    encodeMap: Immutable.Map({})
  }),

  // Hungarian
  hu: Immutable.Map({
    isConsonant: function (letter) {
      return (letter === 'b') ||
          (letter === 'c') ||
          (letter === 'cs') ||
          (letter === 'd') ||
          (letter === 'dz') ||
          (letter === 'dzs') ||
          (letter === 'f') ||
          (letter === 'g') ||
          (letter === 'gy') ||
          (letter === 'h') ||
          (letter === 'j') ||
          (letter === 'k') ||
          (letter === 'l') ||
          (letter === 'ly') ||
          (letter === 'm') ||
          (letter === 'n') ||
          (letter === 'ny') ||
          (letter === 'p') ||
          (letter === 'q') ||
          (letter === 'r') ||
          (letter === 's') ||
          (letter === 'sz') ||
          (letter === 't') ||
          (letter === 'ty') ||
          (letter === 'v') ||
          (letter === 'w') ||
          (letter === 'x') ||
          (letter === 'y') ||
          (letter === 'z') ||
          (letter === 'zs');
    },
    isVowel: function (letter) {
      return (letter === CONSTANTS.BLANK) ||
          (letter === 'a') ||
          (letter === 'á') ||
          (letter === 'e') ||
          (letter === 'é') ||
          (letter === 'i') ||
          (letter === 'í') ||
          (letter === 'o') ||
          (letter === 'ó') ||
          (letter === 'ö') ||
          (letter === 'ő') ||
          (letter === 'u') ||
          (letter === 'ú') ||
          (letter === 'ü') ||
          (letter === 'ű');
    },
    encodeMap: Immutable.Map({
      'á': 'A',
      'é': 'E',
      'í': 'I',
      'ö': 'Q',
      'ü': 'X',
      'ó': 'O',
      'ő': 'W',
      'ú': 'U',
      'ű': 'Y',
      'dz': 'D',
      'dzs': 'P',
      'sz': 'S',
      'gy': 'G',
      'ny': 'N',
      'cs': 'C',
      'ty': 'T',
      'zs': 'Z',
      'ly': 'L'
    })
  })
});
