'use strict';

var SCORING_METHOD = {
  REGULAR: 1,
  SQUARE: 2
};

function isScoringMethod(scoringMethod, methodToCheck) {
  if (scoringMethod === methodToCheck) {
    return true;
  } else {
    if (SCORING_METHOD.hasOwnProperty(scoringMethod) && SCORING_METHOD[scoringMethod] === methodToCheck) {
       return true;
     } else {
       return false;
     }
  }
}

var Score = function (board, dictionary, scoring) {
  this.board = board;
  this.dictionary = dictionary;

  this.scoring = SCORING_METHOD.REGULAR;
  if (scoring) {
    if (SCORING_METHOD.hasOwnProperty(scoring)) {
      this.scoring = SCORING_METHOD[scoring];
    } else {
      this.scoring = scoring;
    }
  }
};

Score.prototype.getScore = function (move, ignoreDictionary) {
  var i;
  var x;
  var y;

  var result = {
    score: 0,
    word: '',
    success: false,
    validMove: false,
    isBingo: false,
    message: 'SCORE_NOT_EVALUATED_YET',
    words: []
  };

  var wordsAreValid = true;
  var mainWord = '';
  var tile;
  var prevValue = -1;
  var thisMove;
  var crossWord;
  var valid;
  var validMove = true;

  var partialScore = 0;
  var sumScore = 0;
  var score;
  var partialCrosswordScore;
  var wordMultiplier = 1;
  var modifier;
  var crossWordMultiplier = 1;

  ignoreDictionary = ignoreDictionary || false;

  var isValidMove = this.board.isValidMove(move);

  if (isValidMove.success) {

    for (i = 0; i < isValidMove.move.length; i += 1) {
      thisMove = isValidMove.move[i];

      if (isValidMove.direction === 'x') {
        // x direction
        y = thisMove.y;
        x = thisMove.x;

        if (i === 0) {
          while (x > 0) {
            x = x - 1;
            tile = this.board.getTile(x, y);
            if (tile) {
              partialScore += tile.value;
              mainWord = tile.letter + mainWord;
            } else {
              break;
            }
          }
        } else {
          x = prevValue;
          while (x < thisMove.x) {
            x = x + 1;
            tile = this.board.getTile(x, y);
            if (tile) {
              partialScore += tile.value;
              mainWord += tile.letter;
            } else {
              break;
            }
          }
        }

        mainWord += thisMove.tile.letter;

        y = thisMove.y;
        x = thisMove.x;
        crossWord = '';
        partialCrosswordScore = 0;
        crossWordMultiplier = 1;
        while (y > 0) {
          y = y - 1;
          tile = this.board.getTile(x, y);
          if (tile) {
            partialCrosswordScore += tile.value;
            crossWord = tile.letter + crossWord;
          } else {
            break;
          }
        }

        crossWord += thisMove.tile.letter;
        modifier = this.board.getModifier(thisMove.x, thisMove.y);
        if (modifier.type === 'LETTER') {
          partialCrosswordScore += thisMove.tile.value * modifier.multiplier;
          partialScore += thisMove.tile.value * modifier.multiplier;
        } else {
          // word
          crossWordMultiplier =  modifier.multiplier;
          partialCrosswordScore += thisMove.tile.value;
          partialScore += thisMove.tile.value;
        }


        y = thisMove.y;
        x = thisMove.x;
        while (y + 1 < this.board.getSize().y) {
          y = y + 1;
          tile = this.board.getTile(x, y);
          if (tile) {
            partialCrosswordScore += tile.value;
            crossWord += tile.letter;
          } else {
            break;
          }
        }

        if (crossWord.length > 1) {
          score = crossWordMultiplier * partialCrosswordScore;
          valid = ignoreDictionary ? true : this.dictionary.checkWord(crossWord);
          result.words.push({
            word: crossWord,
            score: score,
            valid: valid
          });
          validMove = validMove && valid;
          sumScore += score;
        }

        wordMultiplier *= crossWordMultiplier;
        prevValue = thisMove.x;

      } else {
        // y direction
        y = thisMove.y;
        x = thisMove.x;

        if (i === 0) {
          while (y > 0) {
            y = y - 1;
            tile = this.board.getTile(x, y);
            if (tile) {
              partialScore += tile.value;
              mainWord = tile.letter + mainWord;
            } else {
              break;
            }
          }
        } else {
          y = prevValue;
          while (y < thisMove.y) {
            y = y + 1;
            tile = this.board.getTile(x, y);
            if (tile) {
              partialScore += tile.value;
              mainWord += tile.letter;
            } else {
              break;
            }
          }
        }

        mainWord += thisMove.tile.letter;

        y = thisMove.y;
        x = thisMove.x;
        crossWord = '';
        partialCrosswordScore = 0;
        crossWordMultiplier = 1;
        while (x > 0) {
          x = x - 1;
          tile = this.board.getTile(x, y);
          if (tile) {
            partialCrosswordScore += tile.value;
            crossWord = tile.letter + crossWord;
          } else {
            break;
          }
        }

        crossWord += thisMove.tile.letter;
        modifier = this.board.getModifier(thisMove.x, thisMove.y);
        if (modifier.type === 'LETTER') {
          partialCrosswordScore += thisMove.tile.value * modifier.multiplier;
          partialScore += thisMove.tile.value * modifier.multiplier;
        } else {
          // word
          crossWordMultiplier =  modifier.multiplier;
          partialCrosswordScore += thisMove.tile.value;
          partialScore += thisMove.tile.value;
        }


        y = thisMove.y;
        x = thisMove.x;
        while (x + 1 < this.board.getSize().x) {
          x = x + 1;
          tile = this.board.getTile(x, y);
          if (tile) {
            partialCrosswordScore += tile.value;
            crossWord += tile.letter;
          } else {
            break;
          }
        }

        if (crossWord.length > 1) {
          score = crossWordMultiplier * partialCrosswordScore;
          valid = ignoreDictionary ? true : this.dictionary.checkWord(crossWord);
          result.words.push({
            word: crossWord,
            score: score,
            valid: valid
          });
          validMove = validMove && valid;
          sumScore += score;
        }

        wordMultiplier *= crossWordMultiplier;
        prevValue = thisMove.y;

      }
    }

    if (isValidMove.direction === 'x') {
      // x direction
      y = thisMove.y;
      x = thisMove.x;
      while (x + 1 < this.board.getSize().x) {
        x = x + 1;
        tile = this.board.getTile(x, y);
        if (tile) {
          partialScore += tile.value;
          mainWord += tile.letter;
        } else {
          break;
        }
      }
    } else {
      // y direction
      y = thisMove.y;
      x = thisMove.x;
      while (y + 1 < this.board.getSize().y) {
        y = y + 1;
        tile = this.board.getTile(x, y);
        if (tile) {
          partialScore += tile.value;
          mainWord += tile.letter;
        } else {
          break;
        }
      }
    }

    if (mainWord.length > 1) {
      score = wordMultiplier * partialScore;
      valid = ignoreDictionary ? true : this.dictionary.checkWord(mainWord);
      result.words.push({
        word: mainWord,
        score: score,
        valid: valid
      });
      sumScore += score;
      if (isValidMove.move.length === 7) {
        sumScore += 50;
        result.isBingo = true;
      } else {
        if (isScoringMethod(this.scoring, SCORING_METHOD.SQUARE)) {
          sumScore += isValidMove.move.length * isValidMove.move.length;
        }
      }
      validMove = validMove && valid;
    }

    if (ignoreDictionary) {
      result.validMove = true;
    } else {
      result.validMove = validMove;
    }

    if (result.validMove) {
      result.word = result.words[result.words.length - 1].word;
      result.score = sumScore;
      result.message = 'SCORE_OK';
    } else {
      result.message =  'SCORE_INVALID_WORD';
    }

    result.success = true;

  } else {
    result.success = isValidMove.success;
    result.message = isValidMove.message;
  }

  return result;
};


module.exports = Score;
