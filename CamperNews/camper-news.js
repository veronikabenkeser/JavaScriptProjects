$(document).ready(function() {

  var parameters = {
    "Accept": "application/json"
  };

  setTimeout(showIntroText(".typedText", "Camper News", 0, 80), 20);

  $.ajax({
    type: "GET",
    url: "http://www.freecodecamp.com/stories/hotStories",
    dataType: "json",
    headers: parameters,
    beforeSend: function() {
      $(".loading").css("visibility", "visible");
    },
    success: function(data) {
      populateFields(data);
      $(".loading").css("display", "none");
    }
    ,
    error: function(xhr, status, error) {
      console.log("ERROR");
      console.log(error.message);
    }
  });

  $(document).ajaxComplete(function() {
    $(".sticker").click(function() {
      goToComments2($(this));
    });

    $(".sticker").hover(function() {
      changeStickerColor($(this));
    }, function() {
      $(this).css("background-color", "yellow");
      $(this).find('mark').css("background-color", "yellow");
    });

  });
});

function populateFields(arr) {
  var $item;
  var limit = 6;
  var tempcount = 0;
  var indexOfStartingItem = 0;
  for (var i = 0; i < arr.length; i++) {
    $item = $('<div class = "grid-item"></div>');

    var numLikes;
    var $subsequentDiv1;
    var $subsequentDiv2;
    var $subsequentDiv3;
    var $subsequentDiv4;

    if (arr[i].image) {
      $subsequentDiv1 = $('<div class="image-background"><img src="' + arr[i].image + '" alt="user\'s picture" onerror="imgError(this)"; /></div>');
    } else {
      $subsequentDiv1 = $('<div class="image-background"><img src="' + arr[i].author.picture + '" alt="user\'s picture" onerror="imgError(this)"; /></div>');
    }

    if (Array.isArray(arr[i].upVotes)) {
      $subsequentDiv2 = $('<div class = "icon" ><img  src="http://i358.photobucket.com/albums/oo27/picturesqueworlds/thumbs_up2_zpsbzwfw99m.png" alt="number of likes"/><p>' + arr[i].upVotes.length + '</p></div>');
    } else {
      if (arr[i].upVotes[0].upVotedBy === "") {
        $subsequentDiv2 = "";
      } else {
        $subsequentDiv2 = $('<div class = "icon" ><img  src="http://i358.photobucket.com/albums/oo27/picturesqueworlds/thumbs_up2_zpsbzwfw99m.png" alt="number of likes"/><p>1</p></div>');
      }
    }

    var $link = $('<a href="' + arr[i].link + '" target="_blank"></a>');
    $subsequentDiv1.wrapInner($link);

    $subsequentDiv3 = $('<div class= "headline"<p>' + arr[i].headline + '</p></div>');
    $subsequentDiv3.wrapInner($link);

    $subsequentDiv4 = $('<div class = "sticker"><mark>comment</mark></div>');
    $subsequentDiv4.wrapInner($link);
    $item.append($subsequentDiv1).append($subsequentDiv2).append($subsequentDiv3).append($subsequentDiv4);

    $(".grid").append($item);
  }

  $('.grid').imagesLoaded(function() {
    $('.grid').masonry({
      itemSelector: '.grid-item',
      isFitWidth: true,
      isAnimated: true
    });
  });

  $('.grid-item').each(function(index, element) {

    console.log(
      "in each");
    d = Math.random() * 1000; //1ms to 1000ms delay
    $(this).delay(d).animate({
      opacity: 1
    }, {
      step: function(go) {
        $(this).css('transform', 'rotateY(' + go * 360 + 'deg)');

        $(this).css('-moz-transform', 'rotateY(' + go * 360 + 'deg)');
        $(this).css('-webkit-transform', 'rotateY(' + go * 360 + 'deg)');
        $(this).css('-o-transform', 'rotateY(' + go * 360 + 'deg)');
      },
      duration: 1000,
      complete: function() {}
    });
  });

}

function showIntroText(position, text, index, time) {
  $(position).append(text[index++]);
  setTimeout(function() {
    showIntroText(position, text, index, time);
  }, time);
}

function imgError(image) {
  image.onerror = "";
  image.src = "http://i358.photobucket.com/albums/oo27/picturesqueworlds/rsz_1rsz_2m9xby62q9b_zpshypsplxr.png";
  return true;
}

function changeStickerColor($obj) {
  $obj.css("background-color", "red");
  $obj.find('mark').css("background-color", "red");
}
