'use strict';

var CheatSheet = require('../CheatSheet');
var i;
var dicts = ['/../en/WL2014.json', '/../hu/me2007.json'];

for (i = 0; i < dicts.length; i += 1) {
  var cheatsheet = new CheatSheet(__dirname + dicts[i]);

  // cheatsheet.prettyPrint('2 letter words', cheatsheet.get2LetterWords());
  // cheatsheet.prettyPrint('3 letter words', cheatsheet.get3LetterWords());

  // cheatsheet.prettyPrint('2 letter hooks', cheatsheet.getHooks(2));

  // cheatsheet.prettyPrint('3 letter hooks', cheatsheet.getHooks(3));

  // cheatsheet.getShortWordsWithInFrequentTiles();

  // console.log(cheatsheet.getVowelDumps());
  // console.log(cheatsheet.getConsonantDumps());

  //cheatsheet.getXLetterMakingXplus1(6, 1, 50);
  //cheatsheet.getXLetterAlphagrams(8, 50);

  cheatsheet.generateTextFiles();
}

// gXGXrE?z
// leutAno
// dfah

//console.log(cheatsheet.dictionary.getSolutionForProblem('gXGXrE?zleutAnodfah').byLength['8'].map(function (obj) {return obj.d;}).join(', '));
