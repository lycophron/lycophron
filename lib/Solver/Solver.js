'use strict';

var Tile = require('../Bag/Tile');
var CONSTANTS = require('../Constants');
require('../ArrayExtensions');

var Solver = function (board, score, dictionary) {
  this.board = board;
  this.score = score;
  this.dictionary = dictionary;

  this.anagramCache = {};
  this.anagramCacheExactMatch = {};
  this.anagramCacheExactMatchRegexp = {};
};

Solver.prototype.getSolution = function (letters, regexp, possibleBlanks) {
  var result = [];
  letters.LSort();
  var anagram = letters.join('');

  if (typeof this.anagramCache[anagram] === 'undefined') {
    this.anagramCache[anagram] = this.dictionary.getOnlySolutionForProblem(anagram, null, possibleBlanks);
  } else {
    // console.count('cache hit 2');
  }

  if (regexp) {
    // if (typeof this.anagramCacheExactMatchRegexp[anagram] === 'undefined') {
      // this.anagramCacheExactMatch[anagram] = this.dictionary.getOnlySolutionForProblem(anagram);
      // this.anagramCacheExactMatchRegexp[anagram] = {};
    // }
    // var regexpString = regexp.toString();
    // if (typeof this.anagramCacheExactMatchRegexp[anagram][regexpString] === 'undefined') {
      // this.anagramCacheExactMatchRegexp[anagram][regexpString] = this.anagramCache[anagram].LFilter(function (w) { return regexp.test(w); });
    // }
    // we may need to cache this
    // result = this.anagramCacheExactMatchRegexp[anagram][regexpString];
    result = this.anagramCache[anagram].LFilter(function (w) { return regexp.test(w); });
  } else {
    result = this.anagramCache[anagram];
  }
  return result;
}

Solver.prototype.getCrosswordRegExpY = function (x, y, possibleBlanks) {
  // cross word
  var crosswordPrefix = '';
  var crosswordSuffix = '';
  var crosswordAnagram = [];
  var result;
  var tileAbove;
  var tileBelow;
  var boardSize = this.board.getSize();

  var iy = y;
  while (iy > 0) {
    iy = iy - 1;
    tileAbove = this.board.getTile(x, iy);
    if (tileAbove) {
      crosswordPrefix = tileAbove.letter + crosswordPrefix;
    } else {
      break;
    }
  }
  crosswordAnagram = crosswordPrefix.split('');
  crosswordAnagram.push(CONSTANTS.BLANK);
  iy = y;
  while (iy < boardSize.y - 1) {
    iy = iy + 1;
    tileBelow = this.board.getTile(x, iy);
    if (tileBelow) {
      crosswordSuffix = crosswordSuffix + tileBelow.letter;
    } else {
      break;
    }

  }
  crosswordAnagram = crosswordAnagram.LConcat(crosswordSuffix.split(''));
  //log(x, y, crosswordAnagram);
  if (crosswordAnagram.length > 1) {
    var crossWordSolutions = this.getSolution(crosswordAnagram, null, possibleBlanks);
    if (crossWordSolutions.length > 0) {
      // check regexp
      // console.log('Before', crossWordSolutions.solution);
      var r = new RegExp('^' + crosswordPrefix + '.' + crosswordSuffix + '$');
      var s = crossWordSolutions.LFilter(function (a) {
        return r.test(a);
      });
      // console.log('After', s);
      var crossWordLetters = s.map(function (value) {
        return value[crosswordPrefix.length];
      });
      if (crossWordLetters.length > 0) {
        result = '[' + crossWordLetters.join('') + ']';
      } else {
        result = false;
      }
      // console.log(regExpMap[ix][y].crosswordPatternY);
    } else {
      result = false;
    }
  } else {
    result = '.';
  }

  return result;
};


Solver.prototype.getCrosswordRegExpX = function (x, y, possibleBlanks) {
  // cross word
  var crosswordPrefix = '';
  var crosswordSuffix = '';
  var crosswordAnagram = [];
  var result;
  var boardSize = this.board.getSize();
  var tileBefore;
  var tileAfter;

  var ix = x;
  while (ix > 0) {
    ix = ix - 1;
    tileBefore = this.board.getTile(ix, y);
    if (tileBefore) {
      crosswordPrefix = tileBefore.letter + crosswordPrefix;
    } else {
      break;
    }
  }
  crosswordAnagram = crosswordPrefix.split('');
  crosswordAnagram.push(CONSTANTS.BLANK);
  ix = x;
  while (ix < boardSize.x - 1) {
    ix = ix + 1;
    tileAfter = this.board.getTile(ix, y);
    if (tileAfter) {
      crosswordSuffix = crosswordSuffix + tileAfter.letter;
    } else {
      break;
    }
  }
  crosswordAnagram = crosswordAnagram.LConcat(crosswordSuffix.split(''));
  if (crosswordAnagram.length > 1) {
    var crossWordSolutions = this.getSolution(crosswordAnagram, null, possibleBlanks);
    if (crossWordSolutions.length > 0) {
      // check regexp
      // console.log('Before', crossWordSolutions.solution);
      var r = new RegExp('^' + crosswordPrefix + '.' + crosswordSuffix + '$');
      var s = crossWordSolutions.LFilter(function (a) {
        return r.test(a);
      });
      // console.log('After', s);
      var crossWordLetters = s.map(function (value) {
        return value[crosswordPrefix.length];
      });
      if (crossWordLetters.length > 0) {
        result = '[' + crossWordLetters.join('') + ']';
      } else {
        result = false;
      }
      // console.log(regExpMap[ix][y].crosswordPatternY);
    } else {
      result = false;
    }
  } else {
    result = '.';
  }

  return result;
};


Solver.prototype.getMoveHash = function (possibleMove) {
  return possibleMove.x + ':' + possibleMove.y + possibleMove.direction + possibleMove.regExp.toString();
};

Solver.prototype.generateMoves = function (possibleMove, rack) {
  var result;
  var i;
  var j;
  var letters = rack.tiles.map(function (a) { a.clearBlank(); return a.letter; });
  letters = letters.LConcat(possibleMove.extraLetters);

  if (possibleMove.regExp.toString().indexOf('[^A-Za-z]') > -1) {
    return false;
  }

  var solution = this.getSolution(letters, possibleMove.regExp, possibleMove.possibleBlanks);

  if (solution.length > 0) {
    result = true;
    possibleMove.words = [];
    possibleMove.moves = [];
    var tempBlanks = rack.tiles.LFilter(function (t) { return t.isBlank(); });
    var tempNotBlanks = rack.tiles.LFilter(function (t) { return t.isBlank() === false; });

    for (i = 0; i < solution.length; i += 1) {
      if (possibleMove.regExp.test(solution[i])) {
        var tempRack = rack.tiles.LForClone();
        var move = [];
        var blankValues = [];
        for (j = 0; j < possibleMove.positions.length; j += 1) {
          var letterToPick;
          var xCord;
          var yCord;
          var tile = null;
          var blanks = tempBlanks.LForClone();
          var notBlanks = tempNotBlanks.LForClone();
          var possiblePicks;

          if (possibleMove.direction === 'x') {
            // x direction
            xCord = possibleMove.positions[j];
            yCord = possibleMove.y;
            letterToPick = solution[i][possibleMove.positions[j] - possibleMove.x];
          } else if (possibleMove.direction === 'y') {
            // y direction
            xCord = possibleMove.x;
            yCord = possibleMove.positions[j];
            letterToPick = solution[i][possibleMove.positions[j] - possibleMove.y];
          } else {
            throw new Error('Unknown direction: ' + possibleMove.direction);
          }

          for (var k = 0; k < notBlanks.length; k += 1) {
            var thisTile = notBlanks[k];
            if (thisTile.letter === letterToPick) {
              tile = thisTile;
            }
          }

          if (tile) {
            tempRack.splice(tempRack.indexOf(tile), 1);
            move.push({
              x: xCord,
              y: yCord,
              tile: tile
            });
          } else {
            tile = blanks.pop();
            if (tile &&
              (this.dictionary.isConsonant(letterToPick) || this.dictionary.isVowel(letterToPick))) {

              blankValues.push(letterToPick);
              move.push({
                x: xCord,
                y: yCord,
                tile: new Tile(letterToPick, 0)
              });
            } else {
              // not good
              move = [];
            }
          }

          if (blankValues.length > 0) {
            // console.log('TODO: switch blanks 1');
          }
          if (blanks.length > 0) {
            // console.log('TODO: switch blanks 2');
          }
        }

        if (move.length > 0) {
          possibleMove.moves.push(move);
          possibleMove.words.push(solution[i]);
        }
      }
    }

    if (possibleMove.words.length === 0) {
      result = false;
    }
  } else {
    result = false;
  }

  return result;
};

function log(xPos, yPos, message) {
  if (xPos === 7 && yPos === 3) {
    console.log(xPos, yPos, message);
  }
}

Solver.prototype.dumpTest = function (board, rack, time) {
  var ix;
  var iy;
  var i;
  var boardSize = board.getSize();
  var lines = [];

  lines.push('// Test information: ' + time);
  lines.push('// set board');
  for (ix = 0; ix < boardSize.x; ix += 1) {
    for (iy = 0; iy < boardSize.y; iy += 1) {
      var tile = board.getTile(ix, iy);
      if (tile) {
        lines.push('board.setTile(' + ix + ', ' + iy + ', new Tile(\'' + tile.letter + '\', ' + tile.value + '));');
      }
    }
  }

  lines.push('// set rack');
  for (i = 0; i < rack.tiles.length; i += 1) {
    var tile = rack.tiles[i];
    if (tile) {
      lines.push('rack.addTile(new Tile(\'' + tile.letter + '\', ' + tile.value + '));');
    }
  }

  console.log(lines.join('\n'));
};

Solver.prototype.solve = function (rack) {
  var result = [];
  var x;
  var y;
  var key;
  var i;
  var ix;
  var iy;
  var j;
  var k;
  var move;
  var solution;
  var wordList;
  var word;
  var tempTiles;

  var tile;

  var tiles = rack.getTiles();
  var letters = tiles.map(function (a) { a.clearBlank(); return a.letter; });
  var blanks = tiles.LFilter(function (a) { return a.isBlank(); });
  var hasBlank = blanks.length > 0;
  var blanksToUse;
  var lettersString = letters.join('');

  var crosswordPossibleLetters = [];

  if (blanks.length === 0) {
    crosswordPossibleLetters = letters.LForClone();
  }

  var rackSolution = this.getSolution(letters);

  var possibleMoves = [];
  var possibleMove;
  var moveHashes = {};
  var boardSize = this.board.getSize();

  var regExpMap = new Array(boardSize.x);


  if (this.board.getTile(this.board.xStart, this.board.yStart)) {
    // there are words already on the board
    var testTile = new Tile('a', 1);

    for (ix = 0; ix < boardSize.x; ix += 1) {
      regExpMap[ix] = new Array(boardSize.y);
      for (iy = 0; iy < boardSize.y; iy += 1) {
        regExpMap[ix][iy] = {
          crosswordPatternX: null,
          crosswordPatternY: null
        };
      }
    }

    var timestampStart = new Date().getTime();

    for (y = 0; y < boardSize.y; y += 1) {
      for (x = 0; x < boardSize.x; x += 1) {
        var testMove = this.board.isValidMove([{x: x, y: y, tile: new Tile('a', 1)}]);
        if (testMove.message !== 'BOARD_MOVE_OK') {
          // skip anything where we cannot place tiles.
          continue;
        }
        // console.log(x, y, 'coordinate');

        // for (ix = 0; ix < boardSize.x; ix += 1) {
        //   regExpMap[ix] = new Array(boardSize.y);
        //   for (iy = 0; iy < boardSize.y; iy += 1) {
        //     regExpMap[ix][iy] = {
        //       crosswordPatternX: '',
        //       crosswordPatternY: ''
        //     };
        //   }
        // }

        //////////////////////////////////////////////////////
        // X direction

        ///////////////////////////
        var numTilesToUse = 0;
        var crossWordOk = true;
        var mainRegExp = [];
        var suffixLength = 0;
        var positions = [];
        var extraLetters = [];
        var possibleBlanks = [];

        blanksToUse = blanks.length;

        ix = x;
        while (ix < boardSize.x - 1) {
          ix = ix + 1;
          tile = this.board.getTile(ix, y);
          if (tile) {
            mainRegExp.push(tile.letter);
            suffixLength += 1;
            extraLetters.push(tile.letter);
          } else {
            break;
          }
        }

        ix = x + 1;
        while (ix > 0 && numTilesToUse < tiles.length && crossWordOk) {
          ix = ix - 1;
          tile = this.board.getTile(ix, y);
          if (tile) {
            mainRegExp = [tile.letter].LConcat(mainRegExp);
            extraLetters.push(tile.letter);
          } else {
            numTilesToUse += 1;
            positions.push(ix);

            if (regExpMap[ix][y].crosswordPatternY) {

            } else {
              var crossWordRegexp = this.getCrosswordRegExpY(ix, y, crosswordPossibleLetters);
              if (crossWordRegexp) {
                regExpMap[ix][y].crosswordPatternY = crossWordRegexp;
              } else {
                // log(x, y, crossWordRegexp);
                regExpMap[ix][y].crosswordPatternY = '[^A-Za-z]';
                break;
              }
            }

            var r = new RegExp(regExpMap[ix][y].crosswordPatternY);
            if (r.test(lettersString)) {

            } else {
              if (blanksToUse === 0) {
                crossWordOk = false;
              } else {
                var regexpStr = regExpMap[ix][y].crosswordPatternY;
                possibleBlanks = possibleBlanks.LConcat(regexpStr.substr(1, regexpStr.length - 2));
                blanksToUse = blanksToUse - 1;
              }
            }

            mainRegExp = [regExpMap[ix][y].crosswordPatternY].LConcat(mainRegExp);
          }
          // console.log(x, y, numTilesToUse, mainRegExp);
          while (ix > 0 && this.board.getTile(ix - 1, y)) {
            // there is at least one other tile that we have to pick.
            ix = ix - 1;
            tile = this.board.getTile(ix, y);
            mainRegExp = [tile.letter].LConcat(mainRegExp);
            extraLetters.push(tile.letter);
          }
          // build regexp for words by length and starting position
          var xStart = x - mainRegExp.length + 1 + suffixLength;
          var regExp = new RegExp('^' + mainRegExp.join('') + '$');
          // console.log(xStart, y, numTilesToUse, regExp);
          possibleMove = {
            x: xStart,
            y: y,
            regExp: regExp,
            positions: positions.LForClone(),
            direction: 'x',
            extraLetters: extraLetters,
            possibleBlanks: possibleBlanks
          };

          //log(x, y, possibleMove);

          var moveHash = this.getMoveHash(possibleMove);
          if (typeof moveHashes[moveHash] === 'undefined') {
            moveHashes[moveHash] = null;
            if (this.generateMoves(possibleMove, rack)) {
              possibleMoves.push(possibleMove);
            }
          }

          var iix = x + suffixLength;
          var remainingTiles = tiles.length - numTilesToUse;
          var positions2 = positions.LForClone();
          var mainRegExp2 = mainRegExp.LForClone();
          var crossWordOk2 = true;
          var blanksToUse2 = blanksToUse;
          var possibleBlanks2 = possibleBlanks.LForClone();

          while (iix < boardSize.x - 1 && remainingTiles > 0 && crossWordOk2) {
            iix = iix + 1;
            tile = this.board.getTile(iix, y);
            if (tile) {
              mainRegExp2.push(tile.letter);
              // suffixLength += 1;
              extraLetters.push(tile.letter);
            } else {
              var crossWordRegexp = regExpMap[iix][y].crosswordPatternY;
              if (!crossWordRegexp) {
                crossWordRegexp = this.getCrosswordRegExpY(iix, y, crosswordPossibleLetters);
              }
              if (crossWordRegexp) {
                regExpMap[iix][y].crosswordPatternY = crossWordRegexp;
                mainRegExp2.push(crossWordRegexp);
                remainingTiles -= 1;
                positions2.push(iix);

                var regExp2 = new RegExp('^' + mainRegExp2.join('') + '$');
                // console.log(xStart, y, numTilesToUse, regExp);
                possibleMove = {
                  x: xStart,
                  y: y,
                  regExp: regExp2,
                  positions: positions2.LForClone(),
                  direction: 'x',
                  extraLetters: extraLetters,
                  possibleBlanks: possibleBlanks2
                };
                //log(x, y, possibleMove);
                var moveHash = this.getMoveHash(possibleMove);
                if (typeof moveHashes[moveHash] === 'undefined') {
                  moveHashes[moveHash] = null;
                  if (this.generateMoves(possibleMove, rack)) {
                    possibleMoves.push(possibleMove);
                  }
                }

              } else {
                regExpMap[iix][y].crosswordPatternY = '[^A-Za-z]';
                break;
              }

              var r = new RegExp(regExpMap[iix][y].crosswordPatternY);
              if (r.test(lettersString)) {

              } else {
                if (blanksToUse2 === 0) {
                  crossWordOk2 = false;
                } else {
                  var regexpStr = regExpMap[iix][y].crosswordPatternY;
                  possibleBlanks2 = possibleBlanks2.LConcat(regexpStr.substr(1, regexpStr.length - 2));
                  blanksToUse2 = blanksToUse2 - 1;
                }
              }
            }

          }
        }


        ////////////////////////////////////////////
        // y direction

        var numTilesToUse = 0;
        var crossWordOk = true;
        var mainRegExp = [];
        var suffixLength = 0;
        var positions = [];
        var extraLetters = [];
        var possibleBlanks = [];

        blanksToUse = blanks.length;

        iy = y;
        while (iy < boardSize.y - 1) {
          iy = iy + 1;
          tile = this.board.getTile(x, iy);
          if (tile) {
            mainRegExp.push(tile.letter);
            suffixLength += 1;
            extraLetters.push(tile.letter);
          } else {
            break;
          }
        }

        iy = y + 1;
        while (iy > 0 && numTilesToUse < tiles.length && crossWordOk) {
          iy = iy - 1;
          tile = this.board.getTile(x, iy);
          if (tile) {
            mainRegExp = [tile.letter].LConcat(mainRegExp);
            extraLetters.push(tile.letter);
          } else {
            numTilesToUse += 1;
            positions.push(iy);

            if (regExpMap[x][iy].crosswordPatternX) {

            } else {
              var crossWordRegexp = this.getCrosswordRegExpX(x, iy, crosswordPossibleLetters);
              if (crossWordRegexp) {
                regExpMap[x][iy].crosswordPatternX = crossWordRegexp;
              } else {
                regExpMap[x][iy].crosswordPatternX = '[^A-Za-z]';
                break;
              }
            }

            var r = new RegExp(regExpMap[x][iy].crosswordPatternX);
            if (r.test(lettersString)) {

            } else {
              if (blanksToUse === 0) {
                crossWordOk = false;
              } else {
                var regexpStr = regExpMap[x][iy].crosswordPatternX;
                possibleBlanks = possibleBlanks.LConcat(regexpStr.substr(1, regexpStr.length - 2));
                blanksToUse = blanksToUse - 1;
              }
            }

            mainRegExp = [regExpMap[x][iy].crosswordPatternX].LConcat(mainRegExp);
          }
          // console.log(x, y, numTilesToUse, mainRegExp);
          while (iy > 0 && this.board.getTile(x, iy - 1)) {
            // there is at least one other tile that we have to pick.
            iy = iy - 1;
            tile = this.board.getTile(x, iy);
            mainRegExp = [tile.letter].LConcat(mainRegExp);
            extraLetters.push(tile.letter);
          }
          // build regexp for words by length and starting position
          var yStart = y - mainRegExp.length + 1 + suffixLength;
          var regExp = new RegExp('^' + mainRegExp.join('') + '$');
          // console.log(xStart, y, numTilesToUse, regExp);
          possibleMove = {
            x: x,
            y: yStart,
            regExp: regExp,
            positions: positions.LForClone(),
            direction: 'y',
            extraLetters: extraLetters,
            possibleBlanks: possibleBlanks
          };

          var moveHash = this.getMoveHash(possibleMove);
          if (typeof moveHashes[moveHash] === 'undefined') {
            moveHashes[moveHash] = null;
            if (this.generateMoves(possibleMove, rack)) {
              possibleMoves.push(possibleMove);
            }
          }

          var iiy = y + suffixLength;
          var remainingTiles = tiles.length - numTilesToUse;
          var positions2 = positions.LForClone();
          var mainRegExp2 = mainRegExp.LForClone();
          var crossWordOk2 = true;
          var blanksToUse2 = blanksToUse;
          var possibleBlanks2 = possibleBlanks.LForClone();

          while (iiy < boardSize.y - 1 && remainingTiles > 0 && crossWordOk2) {
            iiy = iiy + 1;
            tile = this.board.getTile(x, iiy);
            if (tile) {
              mainRegExp2.push(tile.letter);
              // suffixLength += 1;
              extraLetters.push(tile.letter);
            } else {
              var crossWordRegexp = regExpMap[x][iiy].crosswordPatternX;
              if (!crossWordRegexp) {
                crossWordRegexp = this.getCrosswordRegExpX(x, iiy, crosswordPossibleLetters);
              }
              if (crossWordRegexp) {
                regExpMap[x][iiy].crosswordPatternX = crossWordRegexp;
                mainRegExp2.push(crossWordRegexp);
                remainingTiles -= 1;
                positions2.push(iiy);

                var regExp2 = new RegExp('^' + mainRegExp2.join('') + '$');
                // console.log(xStart, y, numTilesToUse, regExp);
                possibleMove = {
                  x: x,
                  y: yStart,
                  regExp: regExp2,
                  positions: positions2.LForClone(),
                  direction: 'y',
                  extraLetters: extraLetters,
                  possibleBlanks: possibleBlanks2
                };
                // log(x, y, possibleMove);
                var moveHash = this.getMoveHash(possibleMove);
                if (typeof moveHashes[moveHash] === 'undefined') {
                  moveHashes[moveHash] = null;
                  if (this.generateMoves(possibleMove, rack)) {
                    possibleMoves.push(possibleMove);
                  }
                }

              } else {
                regExpMap[x][iiy].crosswordPatternX = '[^A-Za-z]';
                break;
              }

              var r = new RegExp(regExpMap[x][iiy].crosswordPatternX);
              if (r.test(lettersString)) {

              } else {
                if (blanksToUse2 === 0) {
                  crossWordOk2 = false;
                } else {
                  var regexpStr = regExpMap[x][iiy].crosswordPatternX;
                  possibleBlanks2 = possibleBlanks2.LConcat(regexpStr.substr(1, regexpStr.length - 2));
                  blanksToUse2 = blanksToUse2 - 1;
                }
              }
            }

          }
        }
      }
    }

    // console.log(possibleMoves);
  } else {
    // first word, we will find solutions for x direction only
    var l;
    key = rack.tiles.length;

    for (x = this.board.xStart - key; x < this.board.xStart; x += 1) {
      // word = rackSolution[l];
      for (k = 0; k < x + 1 - this.board.xStart + key; k += 1) {
        // console.log(x + 1, k);
        positions = [];
        for (l = x; l < x + key - k; l += 1) {
          positions.push(l + 1);
        }

        possibleMove = {
          x: x + 1,
          y: this.board.yStart,
          regExp: new RegExp('^' + (new Array(key - k + 1)).join('.') + '$'),
          positions: positions,
          direction: 'x',
          extraLetters: [],
          possibleBlanks: []
        };

        // console.log(possibleMove);

        var moveHash = this.getMoveHash(possibleMove);
        if (typeof moveHashes[moveHash] === 'undefined') {
          moveHashes[moveHash] = null;
          if (this.generateMoves(possibleMove, rack)) {
            possibleMoves.push(possibleMove);
          }
        }
      }

    }
  }

  var timestampFinish = new Date().getTime();
  if (timestampFinish - timestampStart > 5000) {
    this.dumpTest(this.board, rack, timestampFinish - timestampStart);
  }

  for (i = 0; i < possibleMoves.length; i += 1) {
    for (j = 0; j < possibleMoves[i].moves.length; j += 1) {
      var move = possibleMoves[i].moves[j];
      var solution = {
        x: possibleMoves[i].x,
        y: possibleMoves[i].y,
        direction: possibleMoves[i].direction,
        word: possibleMoves[i].words[j],
        score: 0,
        move: move
      }
      solution.score = this.score.getScore(move).score; // no need to check in dictionary
      result.push(solution);
    }
  }

  result.push({score:0, move: []});
  result.sort(function (a, b) {
    if (a.score === b.score) {
      if (a.move.length > 0 && b.move.length > 0) {
        var xDiff = a.move[0].x - b.move[0].x;
        if (xDiff === 0) {
          return a.word.localeCompare(b.word);
        } else {
          return xDiff;
        }
      } else if (a.move.length > 0) {
        return -1;
      } else if (b.move.length > 0) {
        return 1;
      } else {
        return 0;
      }
    } else {
      return b.score - a.score;
    }
  });

  // console.log(this.board.printBoard().join('\n'));

  return result;
};

module.exports = Solver;
