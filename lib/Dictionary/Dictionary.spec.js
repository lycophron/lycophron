'use strict';

var assert = require('assert');
var Dictionary = require('./Dictionary');
var enDict = require('./en/WL2014.json');
var huDict = require('./hu/me2003.json');

describe('Dictionary', function() {
  it('should create a new instance', function () {
    var dictionaryEn = new Dictionary(enDict);
    assert.equal(dictionaryEn.getLanguageCode(), 'en');
    var dictionaryHu = new Dictionary(huDict);
    assert.equal(dictionaryHu.getLanguageCode(), 'hu');
  });

  it('should check word', function () {
    var dictionary = new Dictionary(enDict);
    assert.equal(dictionary.checkWord('aa'), true);
    assert.equal(dictionary.checkWord('bb'), false);
  });

  it('should get solution for anagram', function () {
    var dictionary = new Dictionary(enDict);
    assert.deepEqual(dictionary.getAllWordsForAnagram('aa'), ['aa']);
    assert.deepEqual(dictionary.getAllWordsForAnagram('ab'), ['ab', 'ba']);
    assert.deepEqual(dictionary.getAllWordsForAnagram('q?'), ['qi']);
    assert.equal(dictionary.getAllWordsForAnagram('??').length, 105); // 105 two letter words
  });

  it.skip('should get solution for problem performance test', function () {
    this.timeout(20000);
    var dictionary = new Dictionary(enDict);
    assert.equal(dictionary.getSolutionForProblem('aabbccfggno???').solution.length, 15585);
  });

  it('should get solution for problem', function () {
    var dictionary = new Dictionary(enDict);
    assert.equal(dictionary.getSolutionForProblem('satine?').byLength[7].length, 73);
  });

  it('should get solution for problem with one pattern', function () {
    var dictionary = new Dictionary(enDict);
    assert.deepEqual(dictionary.getSolutionForProblem('satiner', /^antsier$/).byLength[7].length, 1);
  });

  it('should get solution for problem with two patterns', function () {
    var dictionary = new Dictionary(enDict);
    assert.deepEqual(dictionary.getSolutionForProblem('satineas', [/^entasi.$/, /^.{7}$/]).byLength[7].length, 2);
  });

  it('should count vowels and consonants', function () {
    var dictionary = new Dictionary(enDict);
    var expectedResult = {
      numVowels: 5,
      numConsonants: 21
    };
    assert.deepEqual(dictionary.countVowelsAndConsonants('abcdefghijklmnopqrstuvwxyz'), expectedResult);
  });

  it('should count vowels and consonants for Hungarian dictionary', function () {
    var dictionary = new Dictionary(huDict);
    var expectedResult = {
      numVowels: 14,
      numConsonants: 38
    };
    assert.deepEqual(dictionary.countVowelsAndConsonants('aábccsddzdzseéfghiíjkllymnnyoóöőpqrsszttyuúüűvwxyzzs'), expectedResult);
  });

  it('should throw if count vowels and consonants contains invalid letter', function () {
    var dictionary = new Dictionary(enDict);
    assert.throws(
      function() {
        dictionary.countVowelsAndConsonants('A');
      },
      Error
    );
    assert.throws(
      function() {
        dictionary.countVowelsAndConsonants('1');
      },
      Error
    );
  });

  it('should encode word', function () {
    var dictionary = new Dictionary(huDict);
    assert.equal(dictionary.encode('aábccsddzdzseéfghiíjkllymnnyoóöőpqrsszttyuúüűvwxyzzs'), 'aAbccsddzdzseEfghiIjkllymnnyoOQWpqrsszttyuUXYvwxyzzs');
    assert.equal(dictionary.encode(['cs', 'dz', 'dzs', 'ny', 'ly', 'ty', 'zs']), 'CDPNLTZ');
  });

  it('should decode word', function () {
    var dictionary = new Dictionary(huDict);
    assert.equal(dictionary.decode('aAbccsddzdzseEfghiIjkllymnnyoOQWpqrsszttyuUXYvwxyzzs') ,'aábccsddzdzseéfghiíjkllymnnyoóöőpqrsszttyuúüűvwxyzzs');
    assert.equal(dictionary.decode('CDPNLTZ'), 'csdzdzsnylytyzs');
  });

  it('should decode Array', function () {
    var dictionary = new Dictionary(huDict);
    assert.deepEqual(dictionary.decodeArray('CDPNLTZ'), ['cs', 'dz', 'dzs', 'ny', 'ly', 'ty', 'zs']);
    assert.deepEqual(dictionary.decodeArray(['C', 'D', 'P', 'N', 'L', 'T', 'Z']), ['cs', 'dz', 'dzs', 'ny', 'ly', 'ty', 'zs']);
  });

  it('should encode then decode', function () {
    var dictionary = new Dictionary(huDict);
    assert.equal(dictionary.decode(dictionary.encode('á')) , 'á');
  });

});
