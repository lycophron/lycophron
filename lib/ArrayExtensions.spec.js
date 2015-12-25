'use strict';

var assert = require('assert');
require('./ArrayExtensions');

describe('ArrayExtensions', function() {
  it('should clone', function () {
    assert.deepEqual(['1', '2'].LForClone(), ['1', '2']);
  });
});
