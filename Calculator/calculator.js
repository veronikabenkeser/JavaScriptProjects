(function() {
  var app = angular.module('calculatorApp', []);
  app.directive('myAutoFocus', function() {
    return {
      link: {
        pre: function preLink(scope, element, attr) {
          //element[0].focus() would have failed here since the element hasn't rendered;
        },
        post: function postLink(scope, element, attr) {
          // This succeeds since the element has been rendered
          element[0].focus();
        }
      }
    }
  });
  app.controller('CalculatorController', ['$scope', function($scope) {
    $scope.result = "";
    $scope.startAgain = false;
    $scope.internalResult = "";
    $scope.errorDisplay = "";

    $scope.reset = function() {
      $scope.internalResult = "";
      $scope.result = "";
    };

    $scope.showError = function() {
      $scope.errorDisplay = "Malformed expression";
    };

    $scope.removeError = function() {
      $scope.errorDisplay = "";
    };

    $scope.updateExp = function(key) {
      $scope.result += key;
      $scope.internalResult += key;

    };

    $scope.calculate = function() {
      $scope.internalResult = $scope.result;

      //Replace the multiplication sign 'x'
      if ($scope.internalResult.toString().search(/X/g)) {
        $scope.internalResult = $scope.internalResult.toString().replace(/X/g, '*');
      }

      $scope.computePercentage();

      try {
        $scope.$eval($scope.internalResult);
        $scope.result = $scope.$eval($scope.internalResult);
        $scope.internalResult = $scope.result;
        $scope.startAgain = true;

        if (typeof $scope.internalResult === 'undefined') {
          $scope.showError();
        }
      } catch (err) {
        $scope.result;
        $scope.internalResult;
        $scope.showError();
      }
    };

    $scope.computePercentage = function() {
      while ($scope.internalResult.toString().indexOf('%') !== -1) {
        if ($scope.internalResult.match(/^\s*[-\+]?\s*\d+%\s*$/)) {
          $scope.internalResult = $scope.internalResult.replace(/^\s*([-])?\+?\s*(\d+)%\s*$/, "$1$2/100");
        } else if ($scope.internalResult.match(/^\s*([-\+])\1\s*(\d+)%\s*$/)) {
          $scope.internalResult = $scope.internalResult.replace(/^\s*([-\+])\1\s*(\d+)%\s*$/, "$2/100");
        } else if ($scope.internalResult.match(/.*(\d+(?!%)\s*)[-\+]+\s*\d+%/)) {
          $scope.internalResult = $scope.internalResult.replace(/(.*(\d+(?!%)\s*))([-\+])+\s*(\d+)%/, "($1)$3($1)*$4/100");
        } else if ($scope.internalResult.match(/\d+(?!%)\s*[/X\*]\s*\d+%/)) {
          $scope.internalResult = $scope.internalResult.replace(/((\d+)(?!%)\s*[/X\*])\s*(\d+)%/, "$1($3/100)");
        } else {
          $scope.showError();
          break;
        }
      }
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
        }
      } else if (key === "=") {
        $scope.calculate();
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
      'C', 'CE', '%', "/", 7, 8, 9, "X", 4, 5, 6, "-", 1, 2, 3, "+", 0, '.', '='
    ];
  }]);
})();
