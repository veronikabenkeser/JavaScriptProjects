//Gloval vars
var worker;
var wasEmptySquare;
var assignedSymbol = {};

$(document).ready(function() {
  if (window.Worker) {
    worker = new Worker("http://s.codepen.io/veronikabenkeser/pen/pjEqEy.js");
  }

  $(".selection").click(function() {
    startGame($(this).attr('id'));
  });

  $(".row div").on({
    mouseover: function() {
      wasEmptySquare = ($(this).html() === "");
      if (wasEmptySquare && assignedSymbol.human) {
        $(this).append(assignedSymbol.human);
      }
    },
    mouseleave: function() {
      if (wasEmptySquare && assignedSymbol.human) {
        $(this).empty();
      }
    },
    click: function() {
      if (wasEmptySquare && assignedSymbol.human) {
        var row = $(this).closest(".row").attr('id');
        var col = $(this).prevAll().size() + 1;

        worker.postMessage({
          messageType: 'record-human-moved',
          row: row,
          col: col
        });
      }
      $(this).off('mouseleave');
    }
  });

  //If the browser suppors the Worker API, create a web worker that will be executing the minimax algorithm.

});

function startGame(humanSym) {
  //Hide the choice panel
  $(".choice-bubble").css('display', 'none');

  //Assign symbols 
  assignedSymbol.human = humanSym;
  assignedSymbol.computer = assignedSymbol.human === "X" ? "O" : "X";

  //If the player picked to be "O", then the computer goes first. If the player picked to be "X", the game has technically already started/ do nothing until the player makes his/her move. 
  if (humanSym !== "X") {
    worker.postMessage({
      messageType: 'make-computer-move'
    });
    //Responding to the message sent back from the worker/ response to worker's postMessage
    worker.onmessage = function(e) {
    };
  }
}
