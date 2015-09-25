var board = [];

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
