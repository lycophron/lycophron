////////////////////////////////////////////////////////////////////////////////
//
// FIXME: WARNING
//
// TODO: THIS IS A TEMPORARY IMPLEMENTATION, MUST BE COMPLETELY REWRITTEN
//
////////////////////////////////////////////////////////////////////////////////

var $ = require('jquery');
var request = require('superagent');
var URI = require('urijs');

var L = require('../lib/lycophron');
L.version = require('../version.json');

console.log(L);

var messageE = $('.message');
var problemIdE = $('#problemId');
var vowelsE = $('#vowels');
var consonantsE = $('#consonants');

messageE.html('Downloading and initializing dictionary ... ');
var dictionary = new L.Dictionary('hu' + '/' + 'me2003' + '.json');

dictionary.ready()
.then(function () {
  messageE.html('Dictionary is ready.');

  function problemToText(problemId) {
    problemId = problemId || '';
    return dictionary.decodeArray(problemId.split('')).join(' ').toUpperCase();
  }

  function textToProblemId(text) {
    text = text || '';
    var encoded = dictionary.encodeArray(text.toLowerCase().split(' '));
    var result = [];

    messageE.html('Checking letters ... ');
    var invalidInputs = [];
    var vowels = [];
    var consonants = [];
    for (var i = 0; i < encoded.length; i += 1) {
      encoded[i] = encoded[i].trim();
      if (encoded[i]) {
        if (dictionary.isVowel(encoded[i])) {
          result.push(encoded[i]);
          vowels.push(dictionary.decode(encoded[i]));
        } else if (dictionary.isConsonant(encoded[i])) {
          result.push(encoded[i]);
          consonants.push(dictionary.decode(encoded[i]));
        } else {
          console.error('Unrecognized letter: ' + encoded[i]);
          invalidInputs.push(encoded[i]);
        }
      }
    }

    vowels.sort();
    consonants.sort();

    vowelsE.html('[___Vowels___] ' + vowels.join(' ').toUpperCase());
    consonantsE.html('[_Consonants_] ' + consonants.join(' ').toUpperCase());

    if (invalidInputs.length > 0) {
      messageE.html('Ignored letters or characters: ' + invalidInputs.join(', '));
    } else {
      messageE.html('');
    }

    result.sort();

    problemIdE.html('[_Problem_id_] ' +result.join(''));

    return result.join('');
  }

  var inputE = $('input');
  var id = window.location.hash.substring(1);
  if (id) {
    inputE.val(problemToText(id));
  }

  inputE.change(function () {
    //console.log(textToProblemId(inputE.val()));
    updateSolutions();
  });

  function updateSolutions() {
    var problemId = textToProblemId(inputE.val());

    window.location.hash = '#' + problemId;
    var solutions = dictionary.getAllWordsForAnagram(textToProblemId(inputE.val()));
    var resultE = $('#results');
    resultE.children().remove();

    var maxResults = 3000;

    for (var i = 0; i < Math.min(solutions.length, maxResults); i += 1) {
      var solution = solutions[i];
      var decoded = dictionary.decode(solution);
      var word = decoded.length === solution.length ? decoded : decoded + ' [' + solution + ']';
      resultE.append($('<div>', {html: '(' + solution.length + ') ' + word}));
    }

    if (solutions.length > maxResults) {
      resultE.append($('<div>', {html: (solutions.length - maxResults) + ' solutions are not shown.'}));
    }

    // resultE.html(solutions.join(', '));
    // console.log(solutions);
  }

  messageE.html('Looking for initial problem ...');

  updateSolutions();
})
.catch(function (err) {
  console.error(err);
});
