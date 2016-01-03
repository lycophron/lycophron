'use strict';

var utils = require('../utils');
var Immutable = utils.Immutable;
var CONSTANTS = require('../Constants');

module.exports = Immutable.Map({
  hu: Immutable.Map({
    extraBlankValues: Immutable.List(['dz', 'dzs', 'q', 'w', 'x', 'y']),
    type: Immutable.Map({
      standard: Immutable.List([
        Immutable.Map({letter: CONSTANTS.BLANK, count: 2, value: 0}),
        Immutable.Map({letter: 'a', count: 6, value: 1}),
        Immutable.Map({letter: 'e', count: 6, value: 1}),
        Immutable.Map({letter: 'k', count: 6, value: 1}),
        Immutable.Map({letter: 't', count: 5, value: 1}),
        Immutable.Map({letter: 'á', count: 4, value: 1}),
        Immutable.Map({letter: 'l', count: 4, value: 1}),
        Immutable.Map({letter: 'n', count: 4, value: 1}),
        Immutable.Map({letter: 'r', count: 4, value: 1}),
        Immutable.Map({letter: 'i', count: 3, value: 1}),
        Immutable.Map({letter: 'm', count: 3, value: 1}),
        Immutable.Map({letter: 'o', count: 3, value: 1}),
        Immutable.Map({letter: 's', count: 3, value: 1}),
        Immutable.Map({letter: 'b', count: 3, value: 2}),
        Immutable.Map({letter: 'd', count: 3, value: 2}),
        Immutable.Map({letter: 'g', count: 3, value: 2}),
        Immutable.Map({letter: 'ó', count: 3, value: 2}),
        Immutable.Map({letter: 'é', count: 3, value: 3}),
        Immutable.Map({letter: 'h', count: 2, value: 3}),
        Immutable.Map({letter: 'sz', count: 2, value: 3}),
        Immutable.Map({letter: 'v', count: 2, value: 3}),
        Immutable.Map({letter: 'f', count: 2, value: 4}),
        Immutable.Map({letter: 'gy', count: 2, value: 4}),
        Immutable.Map({letter: 'j', count: 2, value: 4}),
        Immutable.Map({letter: 'ö', count: 2, value: 4}),
        Immutable.Map({letter: 'p', count: 2, value: 4}),
        Immutable.Map({letter: 'u', count: 2, value: 4}),
        Immutable.Map({letter: 'ü', count: 2, value: 4}),
        Immutable.Map({letter: 'z', count: 2, value: 4}),
        Immutable.Map({letter: 'c', count: 1, value: 5}),
        Immutable.Map({letter: 'í', count: 1, value: 5}),
        Immutable.Map({letter: 'ny', count: 1, value: 5}),
        Immutable.Map({letter: 'cs', count: 1, value: 7}),
        Immutable.Map({letter: 'ő', count: 1, value: 7}),
        Immutable.Map({letter: 'ú', count: 1, value: 7}),
        Immutable.Map({letter: 'ű', count: 1, value: 7}),
        Immutable.Map({letter: 'ly', count: 1, value: 8}),
        Immutable.Map({letter: 'zs', count: 1, value: 8}),
        Immutable.Map({letter: 'ty', count: 1, value: 10})
      ])
      // TODO: super list
      // super: Immutable.List([])
    })
  }),
  en: Immutable.Map({
    extraBlankValues: Immutable.List([]),
    type: Immutable.Map({
      standard: Immutable.List([
        Immutable.Map({letter: CONSTANTS.BLANK, count: 2, value: 0}),
        Immutable.Map({letter: 'e', count: 12, value: 1}),
        Immutable.Map({letter: 'a', count: 9, value: 1}),
        Immutable.Map({letter: 'i', count: 9, value: 1}),
        Immutable.Map({letter: 'o', count: 8, value: 1}),
        Immutable.Map({letter: 'n', count: 6, value: 1}),
        Immutable.Map({letter: 'r', count: 6, value: 1}),
        Immutable.Map({letter: 't', count: 6, value: 1}),
        Immutable.Map({letter: 'l', count: 4, value: 1}),
        Immutable.Map({letter: 's', count: 4, value: 1}),
        Immutable.Map({letter: 'u', count: 4, value: 1}),
        Immutable.Map({letter: 'd', count: 4, value: 2}),
        Immutable.Map({letter: 'g', count: 3, value: 2}),
        Immutable.Map({letter: 'b', count: 2, value: 3}),
        Immutable.Map({letter: 'c', count: 2, value: 3}),
        Immutable.Map({letter: 'm', count: 2, value: 3}),
        Immutable.Map({letter: 'p', count: 2, value: 3}),
        Immutable.Map({letter: 'f', count: 2, value: 4}),
        Immutable.Map({letter: 'h', count: 2, value: 4}),
        Immutable.Map({letter: 'v', count: 2, value: 4}),
        Immutable.Map({letter: 'w', count: 2, value: 4}),
        Immutable.Map({letter: 'y', count: 2, value: 4}),
        Immutable.Map({letter: 'k', count: 1, value: 5}),
        Immutable.Map({letter: 'j', count: 1, value: 8}),
        Immutable.Map({letter: 'x', count: 1, value: 8}),
        Immutable.Map({letter: 'q', count: 1, value: 10}),
        Immutable.Map({letter: 'z', count: 1, value: 10}),
      ])
      // TODO: super list
      // super: Immutable.List([])
    })
  })
});
