'use strict';

var CONSTANTS = require('../Constants');

var MODIFIER_TYPE = {
  LETTER: 'LETTER',
  WORD: 'WORD'
}

var regularTilePlace = {type: MODIFIER_TYPE.LETTER, multiplier: 1};
var doubleWordTilePlace = {type: MODIFIER_TYPE.WORD, multiplier: 2};
var tripleWordTilePlace = {type: MODIFIER_TYPE.WORD, multiplier: 3};
var doubleLetterTilePlace = {type: MODIFIER_TYPE.LETTER, multiplier: 2};
var tripleLetterTilePlace = {type: MODIFIER_TYPE.LETTER, multiplier: 3};

var Board = function (opts) {

  this.x = 15;
  this.y = 15;
  this.xStart = 7;
  this.yStart = 7;
  this.tiles = [];
  this.modifiers = [];

  this.initialize();
};

Board.prototype.initialize = function () {
  var i;
  var j;

  this.tiles = [];
  for (i = 0; i < this.x; i += 1) {
    this.tiles.push([]);
    for (j = 0; j < this.y; j += 1) {
      this.tiles[i].push(null);
    }
  }

  this.modifiers = [];
  for (i = 0; i < this.x; i += 1) {
    this.modifiers.push([]);
    for (j = 0; j < this.y; j += 1) {
      this.modifiers[i].push(regularTilePlace);
    }
  }

  // standard board
  this.modifiers[0][0] = tripleWordTilePlace;
  this.modifiers[0][7] = tripleWordTilePlace;
  this.modifiers[0][14] = tripleWordTilePlace;
  this.modifiers[7][0] = tripleWordTilePlace;
  this.modifiers[7][14] = tripleWordTilePlace;
  this.modifiers[14][0] = tripleWordTilePlace;
  this.modifiers[14][7] = tripleWordTilePlace;
  this.modifiers[14][14] = tripleWordTilePlace;

  this.modifiers[1][1] = doubleWordTilePlace;
  this.modifiers[1][13] = doubleWordTilePlace;
  this.modifiers[2][2] = doubleWordTilePlace;
  this.modifiers[2][12] = doubleWordTilePlace;
  this.modifiers[3][3] = doubleWordTilePlace;
  this.modifiers[3][11] = doubleWordTilePlace;
  this.modifiers[4][4] = doubleWordTilePlace;
  this.modifiers[4][10] = doubleWordTilePlace;
  this.modifiers[7][7] = doubleWordTilePlace;
  this.modifiers[10][4] = doubleWordTilePlace;
  this.modifiers[10][10] = doubleWordTilePlace;
  this.modifiers[11][3] = doubleWordTilePlace;
  this.modifiers[11][11] = doubleWordTilePlace;
  this.modifiers[12][2] = doubleWordTilePlace;
  this.modifiers[12][12] = doubleWordTilePlace;
  this.modifiers[13][1] = doubleWordTilePlace;
  this.modifiers[13][13] = doubleWordTilePlace;

  this.modifiers[1][5] = tripleLetterTilePlace;
  this.modifiers[1][9] = tripleLetterTilePlace;
  this.modifiers[5][1] = tripleLetterTilePlace;
  this.modifiers[5][5] = tripleLetterTilePlace;
  this.modifiers[5][9] = tripleLetterTilePlace;
  this.modifiers[5][13] = tripleLetterTilePlace;
  this.modifiers[9][1] = tripleLetterTilePlace;
  this.modifiers[9][5] = tripleLetterTilePlace;
  this.modifiers[9][9] = tripleLetterTilePlace;
  this.modifiers[9][13] = tripleLetterTilePlace;
  this.modifiers[13][5] = tripleLetterTilePlace;
  this.modifiers[13][9] = tripleLetterTilePlace;

  this.modifiers[0][3] = doubleLetterTilePlace;
  this.modifiers[0][11] = doubleLetterTilePlace;
  this.modifiers[2][6] = doubleLetterTilePlace;
  this.modifiers[2][8] = doubleLetterTilePlace;
  this.modifiers[3][0] = doubleLetterTilePlace;
  this.modifiers[3][7] = doubleLetterTilePlace;
  this.modifiers[3][14] = doubleLetterTilePlace;
  this.modifiers[6][2] = doubleLetterTilePlace;
  this.modifiers[6][6] = doubleLetterTilePlace;
  this.modifiers[6][8] = doubleLetterTilePlace;
  this.modifiers[6][12] = doubleLetterTilePlace;
  this.modifiers[7][3] = doubleLetterTilePlace;
  this.modifiers[7][11] = doubleLetterTilePlace;
  this.modifiers[8][2] = doubleLetterTilePlace;
  this.modifiers[8][6] = doubleLetterTilePlace;
  this.modifiers[8][8] = doubleLetterTilePlace;
  this.modifiers[8][12] = doubleLetterTilePlace;
  this.modifiers[11][0] = doubleLetterTilePlace;
  this.modifiers[11][7] = doubleLetterTilePlace;
  this.modifiers[11][14] = doubleLetterTilePlace;
  this.modifiers[12][6] = doubleLetterTilePlace;
  this.modifiers[12][8] = doubleLetterTilePlace;
  this.modifiers[14][3] = doubleLetterTilePlace;
  this.modifiers[14][11] = doubleLetterTilePlace;
};

Board.prototype.clear = function () {
  this.initialize();
};

Board.prototype.getSize = function () {
  return {
    x: this.x,
    y: this.y
  };
};

Board.prototype.getModifier = function (x, y) {
  return this.modifiers[x][y];
};

Board.prototype.setTile = function (x, y, tile) {
  this.tiles[x][y] = tile;
};

Board.prototype.getTile = function (x, y) {
  return this.tiles[x][y];
};

Board.prototype.isValidMove = function (move) {
  var result = {
    success: false,
    message: 'BOARD_MOVE_NOT_EVALUATED_YET',
    direction: null, // 'x' or 'y'
    move: [] // ordered list
  };

  var validMove = true;
  var i;
  var j;
  var thisMove;
  var xDirection = true;
  var yDirection = true;
  var hasOneTileInTheMiddle = false;
  var xPrev = -1;
  var yPrev = -1;
  var connected = false;
  var cont = true;
  var blankNotSelected = false;


  if (move.length === 0) {
    validMove = false;
    result.message = 'BOARD_MOVE_IS_EMPTY';

  } else {
    move.sort(function (a, b) {
      if (a.x === b.x) {
        xDirection = false;
        return a.y - b.y;
      } else if (a.y === b.y) {
        yDirection = false;
        return a.x - b.x;
      } else {
        xDirection = false;
        yDirection = false;
      }
    });

    result.move = move;

    // check the new tiles are on one line
    if (xDirection || yDirection) {
      result.direction = xDirection ? 'x' : 'y';

      for (i = 0; i < move.length; i += 1) {
        thisMove = move[i];

        // check if the tiles are on the board
        if (thisMove.x < 0 || thisMove.y < 0) {
          validMove = false;
          result.message = 'BOARD_MOVE_WITH_NEGATIVE_COORDINATE';
          break;
        }
        if (thisMove.x >= this.x || thisMove.y >= this.y) {
          validMove = false;
          result.message = 'BOARD_MOVE_WITH_TOO_BIG_COORDINATE';
          break;
        }

        // check if the new move overlaps with existing tiles
        if (this.getTile(thisMove.x, thisMove.y)) {
          validMove = false;
          result.message = 'BOARD_MOVE_PLACES_A_LETTER_ON_ANOTHER_ONE';
          break;
        }

        if (i > 0) {
          // check if the new tiles are continuous
          if (xDirection && xPrev + 1 !== thisMove.x) {
            for (j = xPrev + 1; j < thisMove.x; j += 1) {
              if (this.getTile(j, yPrev) === null) {
                cont = false;
              }
            }
          }
          if (yDirection && yPrev + 1 !== thisMove.y) {
            for (j = yPrev + 1; j < thisMove.y; j += 1) {
              if (this.getTile(xPrev, j) === null) {
                cont = false;
              }
            }
          }
        }

        xPrev = thisMove.x;
        yPrev = thisMove.y;

        // check if the new tiles are connected to at least another one on board
        if (xPrev > 0 && this.getTile(xPrev - 1, yPrev) !== null) {
          connected = true;
        }
        if (xPrev + 1 < this.x && this.getTile(xPrev + 1, yPrev) !== null) {
          connected = true;
        }
        if (yPrev > 0 && this.getTile(xPrev, yPrev - 1) !== null) {
          connected = true;
        }
        if (yPrev + 1 < this.y && this.getTile(xPrev, yPrev + 1) !== null) {
          connected = true;
        }

        if (thisMove.x === this.xStart && thisMove.y === this.yStart) {
          hasOneTileInTheMiddle = true;
        }

        if (thisMove.tile.value === 0 && thisMove.tile.letter === CONSTANTS.BLANK) {
          blankNotSelected = true;
          break;
        }
      }

      // check if the board has at least one tile in the middle
      if (hasOneTileInTheMiddle) {
        if (move.length < 2) {
          // if there are not tiles, at least two must be placed
          validMove = false;
          result.message = 'BOARD_MOVE_AT_LEAST_TWO_TILES_MUST_BE_USED';
        }
      } else if (this.getTile(this.xStart, this.yStart) === null) {
        validMove = false;
        result.message = 'BOARD_MOVE_INVALID_START_POSITION';
      } else {
        if (connected === false && validMove) {
          validMove = false;
          result.message = 'BOARD_MOVE_TILES_MUST_BE_CONNECTED_TO_TILES_ON_BOARD';
        }
      }

      if (blankNotSelected) {
        validMove = false;
        result.message = 'BOARD_MOVE_BLANK_IS_NOT_SELECTED';
      }

      if (cont === false && validMove) {
        validMove = false;
        result.message = 'BOARD_MOVE_TILES_ARE_DISCONNECTED';
      }

    } else {
      validMove = false;
      result.message = 'BOARD_MOVE_NOT_INLINE';
    }
  }

  result.success = validMove;
  if (result.success) {
      result.message = 'BOARD_MOVE_OK';
  }

  return result;
};

Board.prototype.makeMove = function (move) {
  var result = this.isValidMove(move);
  var i;
  var thisMove;

  if (result.success) {
    // place tiles on the board
    for (i = 0; i < result.move.length; i += 1) {
      thisMove = result.move[i];
      this.setTile(thisMove.x, thisMove.y, thisMove.tile);
    }
  }

  return result;
};

Board.prototype.printModifiers = function () {
  var i;
  var j;
  var line;
  var lines = [];
  for (j = 0; j < this.y; j += 1) {
    line = '';
    for (i = 0; i < this.x; i += 1) {
      if (this.modifiers[i][j].multiplier > 1) {
        line += this.modifiers[i][j].type[0] + this.modifiers[i][j].multiplier;
      } else {
        line += '  ';
      }
    }
    lines.push(line);
  }
  return lines;
};

Board.prototype.printBoard = function (hideModifiers) {
  var i;
  var j;
  var line;
  var tile;
  var mod;
  var lines = [];
  hideModifiers = hideModifiers === true;
  for (j = 0; j < this.y; j += 1) {
    line = '';
    for (i = 0; i < this.x; i += 1) {
      if (this.tiles[i][j]) {
        tile = this.tiles[i][j].print();
        line += tile;
        line += new Array(3 - tile.length + 1).join(' ');
      } else {
        if (this.modifiers[i][j].multiplier > 1 && hideModifiers === false) {
          mod = this.modifiers[i][j].type[0] + '_' + this.modifiers[i][j].multiplier;
          line += mod;
          line += new Array(3 - mod.length + 1).join(' ');
        } else {
          line += '   ';
        }
      }
    }
    lines.push(line);
  }
  return lines;
};

module.exports = Board;
