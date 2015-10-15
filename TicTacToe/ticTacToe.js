var TicTacToe = (function ($) {
    var _myWorker;
    var _availArr = [];
    var board = [
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
    var _humanMovesCount = 0;
    var _isHumanTurn = false;
    var messages = {
        'human-win': 'You Win!',
        'computer-win': 'Computer wins!',
        'human-turn': 'Your turn!'
    };

    var _logistics = {
        init: function () {

            _logistics.setLevel();
            _logistics.setPawns();


        },
        displaySettings: function () {
            $(".playing-page").addClass('hide');
            $(".ai").addClass('hide');
            $(".restart").addClass('hide');
            $(".settings").removeClass('hide');
        },
        resetSettings: function () {
            _logistics.settings.level = 0,
                _logistics.settings.humanPawn = "";
            _logistics.settings.computerPawn = "";
            $(".difficulty").children().removeClass('selected');
            $(".selection").removeClass('selected');
        },
        settings: {
            level: 0,
            humanPawn: "",
            computerPawn: ""
        },
        setLevel: function () {

            _logistics.settings.level = 0;
            $(".difficulty").children().click(function () {
                $('.difficulty div').removeClass('selected');
                $(this).addClass('selected');

                _logistics.settings.level = parseInt($(this).text(), 10);

                if (_logistics.settings.humanPawn && _logistics.settings.level) {

                    startGame(_logistics.settings.humanPawn);
                }
            });

        },
        setPawns: function () {
            _logistics.settings.humanPawn = "";
            _logistics.settings.computerPawn = "";
            $(".selection").click(function () {
                $(this).addClass('selected');
                var humanPawn = $(this).attr('id');
                _logistics.settings.humanPawn = humanPawn;
                _logistics.settings.computerPawn = (humanPawn === 'X') ? 'O' : 'X';

                if (_logistics.settings.humanPawn && _logistics.settings.level) {
                    startGame(_logistics.settings.humanPawn);
                }
            });
        }
    };

    var initializeGame = function () {

        _logistics.init();
    };

    var _moves = {
        getCoordinates: function ($obj) {

            var row = $obj.closest(".row").attr('id');
            var col = $obj.prevAll().size() + 1;
            row = parseInt(row, 10);
            col = parseInt(col, 10);

            return [row, col];
        },
        markCells: function (row, col, colorClass) {
            $("#" + row + "").children().eq(parseInt(col, 10) - 1).addClass(colorClass);

        },
        clearGrid: function () {
            $(".grid div").children().empty();
            $(".row").children().removeClass('selected');
        },
        recordMove: function (oldRow, oldCol, newRow, newCol, player) {
            _myWorker.postMessage({
                messageType: 'record-move',
                oldRow: oldRow,
                oldCol: oldCol,
                newRow: newRow,
                newCol: newCol,
                player: player
            });

            _myWorker.postMessage({
                messageType: 'check-game-state',
                player: player
            });
        },
        clearPreviouslySelItems: function () {

            $('.highlighted').removeClass("highlighted");

            $('.oldSq').removeClass('oldSq');
        },
        displayMove: function (oldRow, oldCol, newRow, newCol, player) {

            //Remove old pawn
            if (oldRow !== -1 && oldCol !== -1) {
                $("#" + oldRow + "").children().eq(oldCol - 1).empty();

            }
            //Add new pawn

            $("#" + newRow + "").children().eq(newCol - 1).append(_logistics.settings[player + "Pawn"]);
        },

    };

    var _computerMoves = {
        startComputerMove: function () {
            _isHumanTurn = false;
            $('.moving-cog').removeClass('hide');
            $(".message").empty();
            $(".moving-cog").removeClass('hidden');
            _myWorker.postMessage({
                messageType: 'make-computer-move'
            });
        }
    };

    var _humanMoves = {
        startHumanMove: function (allAvailPosArr) {
            _isHumanTurn = true;
            $('.moving-cog').addClass('hide');
            $(".message").text(messages["human-turn"]);

            _humanMoves.setAvailPos(allAvailPosArr);
        },

        findAdjacentSq: function ($selectedObj, allAvailPosArr) {

            var oldCoord = _moves.getCoordinates($selectedObj);
            var oldRow = oldCoord[0];
            var oldCol = oldCoord[1];


            allAvailPosArr = allAvailPosArr.filter(function (oldAndNewPosArr) {

                return oldAndNewPosArr[0].toString() === [oldRow, oldCol].toString();
            });
            return allAvailPosArr;
        },

        highlightAdjacent: function (arr) {

            arr.forEach(function (oldAndNewPosArr) {

                var row = oldAndNewPosArr[1][0];
                var col = oldAndNewPosArr[1][1];

                _moves.markCells(row, col, "highlighted");
            });

        },
        highlightAvailMoves: function ($obj, allAvailPosArr) {

            if ($obj.text() === _logistics.settings.humanPawn) {

                var legalPosArr = _humanMoves.findAdjacentSq($obj, allAvailPosArr);
                _humanMoves.highlightAdjacent(legalPosArr);
            }
        },

        moveToSq: function ($selectedSq, $oldSq) {

            var newRow = $selectedSq.closest(".row").attr('id');
            var newCol = $selectedSq.prevAll().size() + 1;
            if ($oldSq) {
                var oldCoord = _moves.getCoordinates($oldSq);
                var oldRow = parseInt(oldCoord[0], 10);
                var oldCol = parseInt(oldCoord[1], 10);
                _humanMoves.endHumanMove(oldRow, oldCol, parseInt(newRow, 10), parseInt(newCol, 10));
            } else {
                _humanMoves.endHumanMove(-1, -1, newRow, newCol);
            }
        },

        setAvailPos: function (allAvailPosArr) {

            _availArr = allAvailPosArr;
        },

        getAvailPos: function () {
            return _availArr;
        },

        endHumanMove: function (oldRow, oldCol, newRow, newCol) {


            _moves.recordMove(oldRow, oldCol, newRow, newCol, 'human');

            _humanMovesCount++;
            _moves.displayMove(oldRow, oldCol, newRow, newCol, 'human');

            _computerMoves.startComputerMove();
        },

    };

    var gridListenerOff = function () {
        $(".row div").off("click");
    };

    var gridListenerOn = function () {
        $(".row div").on("click", function () {

            if (_isHumanTurn) {
                var $thisObj = $(this);
                if (_humanMovesCount >= 3 && $thisObj.text() === _logistics.settings.humanPawn) {

                    if (!$thisObj.hasClass('oldSq')) {

                        _moves.clearPreviouslySelItems();
                        var allAvailPosArr = _humanMoves.getAvailPos();
                        _humanMoves.highlightAvailMoves($thisObj, allAvailPosArr);
                        $thisObj.addClass('oldSq');

                    } else {
                        _moves.clearPreviouslySelItems();
                    }

                } else if ($thisObj.text() === "" && _humanMovesCount >= 3) {
                    if ($thisObj.hasClass('highlighted')) {
                        //Move from old pos to new pos
                        _humanMoves.moveToSq($thisObj, $(".oldSq"));
                        _moves.clearPreviouslySelItems();
                    }
                } else if ($thisObj.text() === "" && _humanMovesCount < 3) {
                    _humanMoves.moveToSq($thisObj);
                }
            }
        });
    };

    var startGame = function (humanPawn) {

        $('.intro').addClass('hide');
        $('.settings').addClass('hide');
        $(".playing-page").removeClass('hide');
        $(".ai").removeClass('hide');

        if (humanPawn === 'X') {
            _humanMoves.startHumanMove(board);
        } else {
            _computerMoves.startComputerMove();
        }
    };

    var _createWorker = function () {
        if (window.Worker) {
            _myWorker = new Worker("http://s.codepen.io/veronikabenkeser/pen/GpEyZN.js");

        }

        _myWorker.onmessage = function (e) {
            switch (e.data.messageType) {
            case 'computer-move-done':
                var oldRow = e.data.oldRow;
                var oldCol = e.data.oldCol;
                var newRow = e.data.newRow;
                var newCol = e.data.newCol;
                _moves.recordMove(oldRow, oldCol, newRow, newCol, 'computer');
                $(".moving-cog").addClass('hide');
                _moves.displayMove(oldRow, oldCol, newRow, newCol, 'computer');



                break;

            case 'game-over':
                gridListenerOff();
                _gameOver.showWinner(e.data.winner);

                var winningPawns = e.data.pawns;

                winningPawns.forEach(function (pawn) {
                    pawn = JSON.parse("[" + pawn + "]");
                    var row = pawn[0];
                    var col = pawn[1];
                    _moves.markCells(row, col, "selected");
                });
                _gameOver.showEndGameMessage();

                break;


            case 'avail-human-pos':
                var allAvailPosArr = e.data.allPos;

                _humanMoves.startHumanMove(allAvailPosArr);
                break;
            };
        };
    };

    var createWorker = function () {
        _createWorker();
    }

    var playGame = function () {
        displaySettings();
        /* observeGameState(),*/
        gridListenerOn();
    };

    var displaySettings = function () {
        return _logistics.displaySettings();
    };

    var _gameOver = {
        restartGame: function () {
            $(".restart").click(function () {

                _myWorker.postMessage({
                    messageType: 'restart'
                });
                _logistics.resetSettings();

                _moves.clearGrid();
                _humanMovesCount = 0;
                playGame();

            });
        },
        showEndGameMessage: function () {
            $(".restart").removeClass('hide');
            _gameOver.restartGame();
        },
        showWinner: function (winner) {
            $('.moving-cog').addClass('hide');

            if (winner === "computer") {
                $(".message").text(messages["computer-win"]);

            } else {

                $(".message").text(messages["human-win"]);
            }
        }
    };

    return {
        initializeGame: initializeGame(),
        playGame: playGame(),
        createWorker: createWorker()
    };
})(jQuery);
