var alpha = -1000;
var beta = 1000;
var board = [];
var nameToPositionObj = {
    8: [1, 1],
    1: [1, 2],
    6: [1, 3],
    3: [2, 1],
    5: [2, 2],
    7: [2, 3],
    4: [3, 1],
    9: [3, 2],
    2: [3, 3]
};
var playingBoard = [
    [
        [1, 1], "human"
    ]
];
var initialBoard;

self.addEventListener('message', function(e) {
  switch (e.data.messageType) {
    case 'record-human-move':
      recordMove(e.data.row, e.data.col, human);
      break;

    case 'record-computer-move':
      recordMove(e.data.row, e.data.col, human);
      break;

    case "make-computer-move":
      makeComputerMove();
      break;

    case 'reset':
      clearEverything();
      break;
  };
}, false);

function recordMove(row, col, player) {
}

function makeComputerMove() {
}

function clearEverything() {
}

function initializeBoard(f) {
        board = [
            [1, 1],
            [1, 2],
            [1, 3],
            [2, 1],
            [2, 2],
            [2, 3],
            [3, 1],
            [3, 2],
            [3, 3]
        ];
    }
    (function calculateComputerMove() {
        /*temporary*/
        initializeBoard();
        minimax(7, alpha, beta, "computer");
    })();

function minimax(depth, alpha, beta, player) {
    var availablePos = findEmptySpaces(playingBoard, player);
    var score;
    var oldPos;
    var newPos;
    var bestRow = -1;
    var bestColumn = -1;
    if (depth === 0 || !availablePos.length) {
        var laa = playingBoard;
        score = 10;
        return [score];
    } else {
        for (var p = 0; p < availablePos.length; p++) {
            //Add to board
            oldPos = availablePos[p][0];
            newPos = availablePos[p][1];
            makeTentativeMove(oldPos, newPos, player);
            if (player === "computer") {
                score = minimax(depth - 1, alpha, beta, "human")[0];
                if (score > alpha) {
                    alpha = score;
                    bestRow = newPos[0];
                    bestColumn = newPos[1];
                }
            } else {
                score = minimax(depth - 1, alpha, beta, "computer")[0];
                if (score < beta) {
                    beta = score;
                    bestRow = newPos[0];
                    bestColumn = newPos[1];
                }
            }
            //remove
            if (oldPos.length) {
                //Undo move
                makeTentativeMove(newPos, oldPos, player);
            } else {
                playingBoard.pop();
            }
            if (parseInt(alpha, 10) >= parseInt(beta, 10)) {
                break;
            } 
        }
    }
    //Returning alpha or beta score depending on whose move it was 
    (player === "computer") ? score = alpha: score = beta;
    return [score, bestRow, bestColumn]; //returned for each move after the entire picture is completed and evaluated
}

function makeTentativeMove(moveFrom, moveTo, player) {
    if (moveFrom.length) {
        //Remove old pawn
        for (var i = 0; i < playingBoard.length; i++) {
            if (playingBoard[i][0].toString() === moveFrom.toString()) {
                playingBoard.splice(i, 1);
                break;
            }
        }
    }
    //Add pawn
    playingBoard.push([moveTo, player]);
}

function compareBoards(positionBoard, positionAndPlayerBoard) {
    var allEmptySpaces = [];
    for (var i = 0; i < positionBoard.length; i++) {
        var repeatFound = false;
        for (var q = 0; q < positionAndPlayerBoard.length; q++) {
            if (positionBoard[i].toString() === positionAndPlayerBoard[q][0]
                .toString()) {
                repeatFound = true;
            }
        }
        if (!repeatFound) {
            allEmptySpaces.push(positionBoard[i]);
        }
    }
    return allEmptySpaces;
}

function findEmptySpaces(currentBoard, player) {
    var result = [];
    var entireB = board.slice();
    var thisB = currentBoard.slice();
    //Get all empty spaces
    var allEmptySpaces = compareBoards(entireB, thisB);
    if (currentBoard.length < 6) {
        allEmptySpaces.forEach(function(coordArr) {
            result.push([
                [], coordArr
            ]);
        });
    } else {
        //Find all of the names of the empty squares that are adjacent to the player's symbol
        //Filter by player
        var takenByThisPlayer = thisB.filter(function(val) {
            return val[1] === player
        }).forEach(function(existingPos) {
            var possibleMovesArr = findAdjacent(existingPos[0],
                allEmptySpaces);
            possibleMovesArr.forEach(function(move) {
                result.push([existingPos[0], move]);
            });
        });
    }
    return result;
}

function findAdjacent(currentPosArr, allEmptySpaces) {
    var row = currentPosArr[0];
    var col = currentPosArr[1];
    return allEmptySpaces.filter(function(val) {
        return (!(row === val[0] && col === val[1]) && ((val[0] ===
            row || val[0] + 1 === row || val[0] - 1 ===
            row) && (val[1] === col || val[1] + 1 ===
            col || val[1] - 1 === col)));
    });
}
