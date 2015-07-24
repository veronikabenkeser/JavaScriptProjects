$(document).ready(function() {
  var count = 0;
  console.log("hello!");
  if (count === 0) {
    $(".button").click(function() {
      showQuoteWindow();
      showQuote();
      $(".button").text("Next");
      count++;
    });
  } else {
    $(".button").click(function() {
      showQuote();
    });
  }
});

function showQuoteWindow() {
  $("#message").css('visibility', 'visible');
}

function showQuote() {
  //call to the quotes API
  var parameters = {
    "Accept": "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
    "X-Mashape-Key": "HJbs1iEXfEmshv90sv6bWb99n4R0p1puInOjsnSELJ0KTfl0Re"
  };

  $.ajax({
    type: "GET",
    url: "https://andruxnet-random-famous-quotes.p.mashape.com/cat=famous",
    headers: parameters,
    success: function(data) {
      data = JSON.parse(data);
      var encodedQuote = encodeURI(data.quote);

      $('#quote').html(data.quote);
      $('#author').html(data.author);
      var twitterMaxCharMessage = shrinkChar(encodedQuote, encodedQuote + '~' + data.author + '&url=http%3A%2F%2Fcodepen.io%2Fveronikabenkeser%2Fpen%2FYXOrOW');

      $(".titleAndTwitterContainer a").attr('href', 'https://twitter.com/intent/tweet?text=' + twitterMaxCharMessage);
    },
    error: function(xhr, status, error) {
      console.log('Error: ' + error.message);
    }
  });
}

function shrinkChar(quote, str) {
  var test1 = str;
  if (test1.length > 120 && test1.lastIndexOf('&') != -1) {
    test1 = str.substring(0, test1.lastIndexOf('&'));
    while (test1.length > 120 && test1.lastIndexOf('&') != -1) {
      test1 = test1.substring(0, test1.lastIndexOf('&'));
    }
    //if the length is still greater than 120 and there are no more params to remove, return the str below
    if (test1.length > 120) {
      if (quote.length <= 120) {
        return quote;
      } else {
        return "Check%20this%20out!&url=http%3A%2F%2Fcodepen.io%2Fveronikabenkeser%2Fpen%2FYXOrOW";
      }
    }
  } else {

  }
  return test1;
}
