'use strict';

var assert = require('assert');
var Utils = require('./utils');

describe('utils', function() {
  it('should getId', function () {
    assert.equal(Utils.getId().length, 10);
  });

  it('should make math.random work', function () {
    assert.equal(Math.random() >= 0, true);
    assert.equal(Math.random() < 1, true);
  });
});
