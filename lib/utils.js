'use strict';

var Chance = require('chance');
var chance = new Chance();
var Immutable = require('immutable');

// chance is using Math.random to generate the seed, which is ok.
Math.random = function () {
  console.error('Math.random was used');
  return chance.floating({min: 0, max: 1});
}

module.exports = {
  getId: function () {
    return chance.string({length: 10, pool: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'});
  },
  chance: chance,
  Immutable: Immutable
};;
