(function() {
  var app = angular.module('calculatorApp', []);
  app.controller('CalculatorController', ['$scope', function($scope) {
    $scope.result = "";
    $scope.displayedStr = "";
    $scope.lastNum = 0;
    $scope.startAgain = false;
    $scope.internalResult = "";
    $scope.reset = function() {
      $scope.internalResult = "";
      $scope.result = "";
    };

    $scope.updateValue = function(result) {
      $scope.doOperation(result.toString().slice(-1));
    };
    $scope.showError = function() {
      console.log('error');

    };

    $scope.updateExp = function(key) {
      $scope.result += key;
      $scope.internalResult += key;

    };
    $scope.doOperation = function(key) {
      //If it's a number, add to the screen and to memory

      if (angular.isNumber(key)) {

        //If have already run the '=' once, entering a new num will erase the old result.
        if ($scope.startAgain) {
          $scope.reset();
          $scope.startAgain = false;
          $scope.updateExp(key);
        } else {
          $scope.updateExp(key);
          /* $scope.startAgain = false;*/
        }

      } else if (key === '%') {
        $scope.result += key;

        if ($scope.result.match(/^\s*[-\+]?\s*\d+%\s*$/)) {
          $scope.internalResult = $scope.result.replace(/^\s*([-])?\+?\s*(\d+)%\s*$/, "$1$2/100");
        } else if ($scope.result.match(/^\s*([-\+])\1\s*(\d+)%\s*$/)) {
          $scope.internalResult = $scope.result.replace(/^\s*([-\+])\1\s*(\d+)%\s*$/, "$2/100");
        } else if ($scope.result.match(/.*(\d+(?!%)\s*)[-\+]+\s*\d+%/)) {
          $scope.internalResult = $scope.result.replace(/(.*(\d+(?!%)\s*))([-\+])+\s*(\d+)%/, "($1)$3($1)*$4/100");
        } else if ($scope.result.match(/\d+(?!%)\s*[/X\*]\s*\d+%/)) {
          $scope.internalResult = $scope.result.replace(/((\d+)(?!%)\s*[/X\*])\s*(\d+)%/, "$1($3/100)");
        }

      } else if (key === "=") {
        //Replace the multiplication sign 'x'
        if ($scope.internalResult.toString().search(/X/g)) {
          $scope.internalResult = $scope.internalResult.toString().replace(/X/g, '*');
        }

        try {
          $scope.$eval($scope.internalResult);
          $scope.result = $scope.$eval($scope.internalResult);
          $scope.internalResult = $scope.result;
          $scope.startAgain = true;
        } catch (err) {
          $scope.result;
          $scope.internalResult;
        }
      } else if (key === 'C') {
        $scope.reset();
        $scope.startAgain = false;
      } else if (key === "CE") {
        $scope.result = $scope.result.toString().slice(0, $scope.result.toString().length - 1);
        $scope.internalResult = $scope.internalResult.toString().slice(0, $scope.internalResult.toString().length - 1);

      } else {
        $scope.updateExp(key);
        $scope.startAgain = false;
      }
    };
    $scope.keys = [
      'C', 'CE', '%', "/", 7, 8, 9, "X", 4, 5, 6, "-", 1, 2, 3, 0, '.', '=', "+"
    ];
  }]);
})();
