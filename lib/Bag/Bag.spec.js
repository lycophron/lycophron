'use strict';

var assert = require('assert');
var Bag = require('./Bag');
var Tile = require('./Tile');

describe('Bag', function() {
  describe('#ctor', function () {
    it('should throw if language code is not defined', function () {
      assert.throws(
        function() {
          var bag = new Bag();
        },
        RangeError
      );
    });

    it('should throw if language code is invalid', function () {
      assert.throws(
        function() {
          var bag = new Bag('aa');
        },
        RangeError
      );
    });

    it('should throw if bag type is not defined', function () {
      assert.throws(
        function() {
          var bag = new Bag('en');
        },
        RangeError
      );
    });

    it('should throw if bag type is invalid', function () {
      assert.throws(
        function() {
          var bag = new Bag('en', 'super');
        },
        RangeError
      );
    });

    it('should create a new bag', function () {
      var bagHu = new Bag('hu', 'standard');
      assert.equal(bagHu.getSize(), 100);
      var bagEn = new Bag('en', 'standard');
      assert.equal(bagEn.getSize(), 100);
      assert.equal(bagEn.getNumRemainingTiles(), 100);
    });
  });

  describe('#getTile', function () {
    it('should draw from bag', function () {
      var bag = new Bag('en', 'standard');
      assert.equal(bag.getSize(), 100);
      assert.equal(bag.getNumRemainingTiles(), 100);
      // FIXME: test all drawing methods
      bag.getTile(0);
      bag.getTile(1);
      bag.getTile(2); // number
      bag.getTile('RANDOM'); // string
      bag.getTile(); // undefined
      assert.equal(bag.getNumRemainingTiles(), 95);
      assert.equal(bag.getSize(), 100);
    });

    it('should return with undefined if there are no more tiles', function () {
      var bag = new Bag('en', 'standard');
      var i;
      for (i = 0; i < bag.getSize(); i += 1) {
        assert.notEqual(bag.getTile(), undefined);
      }
      assert.equal(bag.getTile(), undefined);
      assert.equal(bag.getNumRemainingTiles(), 0);
      assert.equal(bag.getSize(), 100);
    });

    it('should throw if drawing method is Unsupported', function () {
      var bag = new Bag('en', 'standard');
      assert.equal(bag.getSize(), 100);
      assert.equal(bag.getNumRemainingTiles(), 100);
      assert.throws(
        function() {
          bag.getTile('UNSUPPORTED'); // string
        },
        Error
      );
      assert.equal(bag.getNumRemainingTiles(), 100);
      assert.equal(bag.getSize(), 100);
    });
  });

  it('should put tile back', function () {
    var bag = new Bag('en', 'standard');
    assert.equal(bag.getSize(), 100);
    assert.equal(bag.getNumRemainingTiles(), 100);
    var tile1 = bag.getTile(0);
    var tile2 = bag.getTile(0);
    assert.equal(bag.getNumRemainingTiles(), 98);
    bag.putTileBack(tile1);
    assert.equal(bag.getNumRemainingTiles(), 99);
    bag.putTileBack(tile2, true);
    assert.equal(bag.getNumRemainingTiles(), 100);
  });

  it('should fail to put tile back if it was not part of the bag', function () {
    var bag = new Bag('en', 'standard');
    assert.equal(bag.getSize(), 100);
    assert.equal(bag.getNumRemainingTiles(), 100);
    var tile1 = new Tile('S', 1);
    assert.throws(
      function() {
        bag.putTileBack(tile1);
      },
      RangeError
    );
    assert.equal(bag.getNumRemainingTiles(), 100);
    assert.equal(bag.getNumRemainingTiles(), 100);
  });

});
