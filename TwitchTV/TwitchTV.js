$(window).load(function() {
  $("li").hover(function() {
    $(this).find($('img').not('.streamIcon')).addClass("spinImageNow");

  }, function() {
    $(this).find("img").removeClass("spinImageNow");
  });
});

$(document).ready(function() {
  //Populate the content class with info from the ajax response
  populateContent();
  $(document).ajaxStop(function() {
    initializeDisp();
  });

  $('input').bind('input propertychange', searchForTerm);

  $(".menuItem").click(function() {
    $(".menuItem.selected").removeClass('selected');
    $(this).addClass('selected');
    filterByTab($(this).attr('id'));
    searchForTerm();
  });

  $(document).keydown(function(event) {
    if (event.which === 9) { //tab key
      event.preventDefault();
      nextTab();
    }
  });

  $('input').keydown(function(event) {
    if (event.which !== 40 && event.which !== 38 && event.which !== 13) return;
    if (event.which === 13) { //enter key
      //If an item is highlighted, open that item in a new window.
      event.preventDefault();
      goToSelectedItem();
    } else {
      var $current;
      var $highlighted = $(".highlighted");

      if (event.which === 40) { //down key

        if (!$highlighted.length || $highlighted.is('.matching:last')) { //If it finds nothing, this will === 0, which is false
          $current = $(".matching:first");

        } else {

          $current = $highlighted.nextAll(".matching:first");
        }
      } else { //up key

        if (!$highlighted.length || $highlighted.is('.matching:first')) {
          $current = $(".matching:last");
        } else {

          $current = $highlighted.prevAll(".matching:first");
        }
      }
      $(".shown").removeClass("highlighted");
      $current.addClass('highlighted');
    }
  });
});

function initializeDisp() {
  $("#all").addClass("selected");
  filterByTab("all");
  searchForTerm();
}

function nextTab() {
  var $active = $(".menuItem.selected").removeClass('selected');
  if ($active.is('.menuItem:last')) {
    $active = $(".menuItem:first");
  } else {
    $active = $active.nextAll(".menuItem:first");
  }
  $active.addClass('selected');
  filterByTab($active.attr('id'));
  searchForTerm();
}

function filterByTab(tabName) {
  if (tabName === 'all') { //show all items
    $("#fullList li").each(function() {
      $(this).slideDown();
      $(this).addClass('shown');
      $(this).removeClass('hidden');
    });
  } else {
    $("#fullList li").each(function() {
      if ($(this).attr('class').indexOf(tabName) === -1) {
        $(this).slideUp();
        $(this).addClass('hidden');
        $(this).removeClass('shown');
      } else {
        $(this).slideDown();
        $(this).addClass('shown');
        $(this).removeClass('hidden');
      }
    });
  }
}

function searchForTerm() {
  var searchTerm = $('input').val().replace(/\s/g, "").toLowerCase();
  if (searchTerm !== "") {
    $("#fullList li").removeClass("highlighted").filter('.shown').removeClass("matching").hide().filter(function() {
      return $(this).attr('id').toLowerCase().indexOf(searchTerm) !== -1
    }).addClass("matching").show();
  } else {
    //Restore original list
    $("#fullList li").removeClass("highlighted").removeClass("matching");
    var tabName = $(".selected").attr('id');
    filterByTab(tabName);
    $(".shown").addClass("matching");
  }
}

function goToSelectedItem() {
  if ($(".highlighted").length) {
    window.open($(".highlighted").find('a').attr('href'));
  }
}

function populateContent() {
  streamers.forEach(function(streamer) {
    makeReq(streamer, getDisplayNameAndLogo);
  });
}

function makeReq(streamer, callback) {
  var parameters = {
    "Accept": "application/json"
  };

  $.ajax({
    type: "GET",
    url: "https://api.twitch.tv/kraken/streams/" + streamer,
    dataType: 'jsonp',
    headers: parameters,
    success: function(data) {
      var channelLink;

      if (data["_links"]) { //if channel still exists/is not undefined
        channelLink = data["_links"].channel;
      }

      var stream = data.stream;

      /*getDisplayNameAndLogo(channelLink);*/

      if (typeof callback === "function" && channelLink) {

        callback(streamer, channelLink, stream, parameters);

        //Display what's streaming if there is something streaming

      } else {
        console.log("Callback is not a function.");
      }

    },
    error: function(xhr, status, error) {
      console.log("ERROR");
      console.log(error.message);
    }
  });
}

function getDisplayNameAndLogo(streamer, link, stream, parameters) {

  $.ajax({
    type: "GET",
    url: link,
    dataType: 'jsonp',
    headers: parameters,
    success: function(data) {
      var logo = data.logo;
      var name = data.display_name;
      var lName = data.name;
      var streamingIcon;
      var item;

      if (logo === null) {
        logo = '<img class = "logoI" src= "http://i358.photobucket.com/albums/oo27/picturesqueworlds/default_red_zpsiq8edrke.png" >';
      } else {
        logo = '<img class="logoI" src="' + logo + '">';
      }
      if (stream !== null) {
        streamingIcon = '<img class = "streamIcon" src= "http://i358.photobucket.com/albums/oo27/picturesqueworlds/agt_action_success_zpsqquksezs.png" >';

      } else {
        streamingIcon = '<img class = "streamIcon" src= "http://i358.photobucket.com/albums/oo27/picturesqueworlds/minus_zpsk2blku6o.png">';
      }

      item = '<li id = ' + name + ' class="' + ' offline" display= "list-item" style = "display: list-item">' + '<a href="http://www.twitch.tv/' + lName + '"' + ' target="_blank">' + logo + '<span>' + name + '</span>' + streamingIcon + '</a></li>';

      if (stream !== null) {
        item = '<li id = ' + name + ' class="online" display= "list-item" style = "display: list-item">' + '<a href="http://www.twitch.tv/' + lName + '"' + ' target="_blank">' + logo + '<span>' + name + '</span>' + streamingIcon + '<div class= "streamName">' + stream.channel.status + '</div></a>' + '</li>';
      }

      $('.content ul').append(item);
    },
    error: function(xhr, status, error) {
      console.log("ERROR");
      console.log(error.message);
    }
  });
}

var streamers = ["freecodecamp", "storbeck", "terakilobyte", "habathcx", "RobotCaleb", "brunofin", "thomasballinger", "noobs2ninjas", "beohoff", "medrybw"];
