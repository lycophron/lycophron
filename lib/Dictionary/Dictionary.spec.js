'use strict';

var assert = require('assert');
var CONSTANTS = require('../Constants');
var Dictionary = require('./Dictionary');
var fs = require('fs');
var enDict = JSON.parse(fs.readFileSync(__dirname + '/en/WL2014.json'));
var huDict = JSON.parse(fs.readFileSync(__dirname + '/hu/me2003.json'));

describe('Dictionary', function() {

  it('should create a new instance', function () {
    this.timeout(20000);
    var dictionaryEn = new Dictionary(enDict);
    assert.equal(dictionaryEn.getLanguageCode(), 'en');
    var dictionaryHu = new Dictionary(huDict);
    assert.equal(dictionaryHu.getLanguageCode(), 'hu');
  });

  describe('en dict', function () {
    var dictionary;

    before(function (done) {
      dictionary = new Dictionary(enDict);
      dictionary.ready().nodeify(done);
    });

    it('should check word', function () {
      assert.equal(dictionary.checkWord('aa'), true);
      assert.equal(dictionary.checkWord('bb'), false);
    });

    it('should get solution for anagram', function () {
      assert.deepEqual(dictionary.getAllWordsForAnagram('aa'), ['aa']);
      assert.deepEqual(dictionary.getAllWordsForAnagram('ab'), ['ab', 'ba']);
      assert.deepEqual(dictionary.getAllWordsForAnagram('q?'), ['qi']);
      assert.equal(dictionary.getAllWordsForAnagram('??').length, 105); // 105 two letter words
    });

    it.skip('should get solution for problem performance test', function () {
      this.timeout(20000);
      assert.equal(dictionary.getSolutionForProblem('aabbccfggno???').solution.length, 15585);
      assert.equal(dictionary.getSolutionForProblem('eeioplqzxyd???').solution.length, 25602);
    });

    it.skip('should get solution for a few anagrams', function () {
      var list1 = [ '?agiino',
        '?afloos',
        '?l',
        '?afoos',
        '?d',
        '?m',
        '?e',
        '?n',
        '?t',
        '?ablnrsu',
        '?ddemnost',
        '?aflos',
        '?ddemnst',
        '?demnost',
        '?ddenost',
        '?ddmnost',
        '?ddemost',
        '?ddemnos',
        '?ablnru',
        '?ddemnot',
        '?o',
        '?abnrsu',
        '?f',
        '?aloos',
        '?u',
        '?ablnrs',
        '?r',
        '?c',
        '?i',
        '?p',
        '?a',
        '?floos',
        '?ablnsu',
        '?ceeipst',
        '?ceiprst',
        '?eeiprst',
        '?ceeprst',
        '?ceeirst',
        '?ceeiprs',
        '?afloo',
        '?ceeiprt',
        '?ceeiprst',
        '?b',
        '?alnrsu',
        '?blnrsu',
        '?ablrsu' ];
      var list2 = [ '?agiinor',
        '?agiino',
        '?aagiino',
        '?aegiino',
        '?acgiino',
        '?agiiino',
        '?agiinop',
        '?agiinot',
        '?agiinott',
        '?agiilno',
        '?addegiimnnoost',
        '?agiinoo',
        '?afgiino',
        '?aafgiilnooos',
        '?adgiino',
        '?aceegiiinoprst',
        '?agiimno',
        '?agiinno',
        '?agiilnoo',
        '?agiinou',
        '?afgiinou',
        '?aagiinor',
        '?abgiino',
        '?abceegiiinoprst',
        '?aabgiilnnorsu' ];
      var i;

      for (i = 0; i < list1.length; i += 1) {
        dictionary.getSolutionForProblem(list1[i]);
      }

      for (i = 0; i < list2.length; i += 1) {
        dictionary.getSolutionForProblem(list2[i]);

        // assert.equal(dictionary.getSolutionForProblem(list2[i]).solution > 1, true);
      }

      console.log(dictionary.cntGetSubWord);
    });

    it('should get solution for problem', function () {
      assert.equal(dictionary.getSolutionForProblem('satine?').byLength[7].length, 73);
    });

    it('should get solution for problem with one pattern', function () {
      assert.deepEqual(dictionary.getSolutionForProblem('satiner', /^antsier$/).byLength[7].length, 1);
    });

    it('should get solution for problem with two patterns', function () {
      assert.deepEqual(dictionary.getSolutionForProblem('satineas', [/^entasi.$/, /^.{7}$/]).byLength[7].length, 2);
    });

    it('should count vowels and consonants', function () {
      var expectedResult = {
        numVowels: 5,
        numConsonants: 21
      };
      assert.deepEqual(dictionary.countVowelsAndConsonants('abcdefghijklmnopqrstuvwxyz'), expectedResult);
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
  });

  describe('hu dict', function () {
    var dictionary;

    before(function (done) {
      dictionary = new Dictionary(huDict);
      dictionary.ready().nodeify(done);
    });

    it('should count vowels and consonants for Hungarian dictionary', function () {
      var expectedResult = {
        numVowels: 14,
        numConsonants: 38
      };
      assert.deepEqual(dictionary.countVowelsAndConsonants('aábccsddzdzseéfghiíjkllymnnyoóöőpqrsszttyuúüűvwxyzzs'), expectedResult);
    });

    it('should encode word', function () {
      assert.equal(dictionary.encode('aábccsddzdzseéfghiíjkllymnnyoóöőpqrsszttyuúüűvwxyzzs'), 'aAbccsddzdzseEfghiIjkllymnnyoOQWpqrsszttyuUXYvwxyzzs');
      assert.equal(dictionary.encode(['cs', 'dz', 'dzs', 'ny', 'ly', 'ty', 'zs']), 'CDPNLTZ');
    });

    it('should decode word', function () {
      assert.equal(dictionary.decode('aAbccsddzdzseEfghiIjkllymnnyoOQWpqrsszttyuUXYvwxyzzs') ,'aábccsddzdzseéfghiíjkllymnnyoóöőpqrsszttyuúüűvwxyzzs');
      assert.equal(dictionary.decode('CDPNLTZ'), 'csdzdzsnylytyzs');
    });

    it('should decode Array', function () {
      assert.deepEqual(dictionary.decodeArray('CDPNLTZ'), ['cs', 'dz', 'dzs', 'ny', 'ly', 'ty', 'zs']);
      assert.deepEqual(dictionary.decodeArray(['C', 'D', 'P', 'N', 'L', 'T', 'Z']), ['cs', 'dz', 'dzs', 'ny', 'ly', 'ty', 'zs']);
    });

    it('should encode then decode', function () {
      assert.equal(dictionary.decode(dictionary.encode('á')) , 'á');
    });

    it('should get solution with possible blanks', function () {
      var solutions = dictionary.getOnlySolutionForProblem(CONSTANTS.BLANK + 'E', null, ['X', 'h']);
      assert.equal(solutions.length, 2);
    });

  });
});
