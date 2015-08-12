$(document).ready(function() {
  $(".contentContainer").hide();
  getWeather(showLoc);

  $("#degree").click(function() {
    switchDeg($("#degree").text());
  });
});

function getWeather(callback) {

  $.ajaxPrefilter(function(options) {
    if (options.crossDomain && jQuery.support.cors && options.url === "http://www.ipaddresslocation.org/ip-address-locator.php") {
      var http = (window.location.protocol === 'http:' ? 'http:' : 'https:');
      options.url = http + '//cors-anywhere.herokuapp.com/' + options.url;
    }
  });

  //Scan this website to find out this computer's city, state, lng, long
  $.get(
    'http://www.ipaddresslocation.org/ip-address-locator.php',

    function(response) {
      var latitReg = /IP\s*Latitude:\s*(?:\s*<\/*\w*>\s*)*([-\d.]+)(?=<)/ig;
      var longReg = /IP\s*Longitude:\s*(?:\s*<\/*\w*>\s*)*([-\d.]+)(?=<)/ig;
      var city = /IP\s*City:\s*(?:\s*<\/*\w*>\s*)*([\w*\s*]+)(?=<)/ig;
      var state = /IP\s*Region:\s*(?:\s*<\/*\w*>\s*)*([\w*\s*]+)(?=<)/ig;
      var lat = latitReg.exec(response)[1];
      var lng = longReg.exec(response)[1];
      var myCity = city.exec(response)[1];
      var myState = state.exec(response)[1];

      if (typeof callback === "function") {
        callback(myCity, myState, lat, lng);
      }
    });
};

function showLoc(city, state, lat, lng) {

  $("#location").append(city);
  $("#location").append(", " + state);

  var parameters = {
    "format": "json",
    "q": lat + "," + lng,
    "key": "60cb9d74f26cedc4016029dddda10",
    "num_of_days": 1,
    "date": "today",
    includeLocation: "yes"
  };

  //Use an API to get the weather
  var timeout;
  $.ajax({

    type: "GET",
    url: "http://api.worldweatheronline.com/free/v2/weather.ashx",
    data: parameters,
    beforeSend: function() {
      timeout = setTimeout(function() {
        showIntroText(".loaderText", "Just a few more seconds until you get an EXCEPTIONALLY accurate weather forecast", 0, 80);
        $("html").css("background", 'url("http://i358.photobucket.com/albums/oo27/picturesqueworlds/6058A0E7AE_zpssmi1l73b.jpg")' + "no-repeat center center fixed");
      }, 3000);
    },
    complete: function() {
      $(".loading").hide();
      $(".loaderText").hide();
      clearTimeout(timeout);
      $(".contentContainer").show();
    },
    success: function(data) {
      var currentWeather = data.data.current_condition[0];
      var temperature = data.data.current_condition[0].temp_F;
      var weatherCode = data.data.current_condition[0].weatherCode;
      var windMph = data.data.current_condition[0].windspeedMiles;
      var windDirection = data.data.current_condition[0].winddir16Point;
      var verbalDesc = data.data.current_condition[0].weatherDesc[0].value;
      //Show information
      //Wind
      $("#wind").text("Wind: " + windMph);
      $("#wind").append(" " + windDirection);

      //verbal description
      $("#verbalDesc").text(verbalDesc);

      //Icon
      $('#iconDiv').append($('<img>', {
        src: pickIcon(verbalDesc),
        width: 80,
        height: 80,
        alt: "Weather Icon",
        title: "Weather Icon"
      }));

      //show temperature
      $("#temperature").text(temperature);
      $("#degree").text("F");
    },

    error: function(xhr, status, error) {
      console.log('Error: ' + error);
      $(".contentContainer").hide();
      $("body").text("This page is currently overloaded. Please come back later.");
      $("html").css("background", 'url("http://i358.photobucket.com/albums/oo27/picturesqueworlds/IUVI2VVDXJ_zpsh1zbooij.jpg")' + "no-repeat center center fixed");
    }
  });
}

function pickIcon(str) {
  var fog = /fog/ig;
  var sunny = /sunny|clear/ig;

  var rain = /sleet|rain|mist|drizzle/ig;
  var partlycloudy = /partly\s*cloudy/ig;
  var cloudy = /cloudy/ig;
  var overcast = /overcast/ig;
  var snow = /snow|ice|freezing/ig;
  var thunder = /thunder/ig;

  if (fog.test(str)) {
    $("html").css("background", 'url("http://i358.photobucket.com/albums/oo27/picturesqueworlds/Z2QPO2P485_zpscnygt6fh.jpg")' + "no-repeat center center fixed");
    return "http://i358.photobucket.com/albums/oo27/picturesqueworlds/weather_fog_zpslzgcirkq.png";
  } else if (sunny.test(str)) {
    $("html").css("background", 'url("http://i358.photobucket.com/albums/oo27/picturesqueworlds/ONV344KX9K_zpszeg0nw3z.jpg")' + "no-repeat center center fixed");
    return "http://i358.photobucket.com/albums/oo27/picturesqueworlds/weather_clear_zpsiabsmpgx.png";
  } else if (rain.test(str)) {
    $("html").css("background", 'url("http://i358.photobucket.com/albums/oo27/picturesqueworlds/45JIYYO371_zpsjfcyoj7u.jpg")' + "no-repeat center center fixed");
    return "http://i358.photobucket.com/albums/oo27/picturesqueworlds/drizzle_zps1yelmy4d.png";
  } else if (partlycloudy.test(str)) {
    $("html").css("background", 'url("http://i358.photobucket.com/albums/oo27/picturesqueworlds/IUVI2VVDXJ_zpsh1zbooij.jpg")' + "no-repeat center center fixed");
    return "http://i358.photobucket.com/albums/oo27/picturesqueworlds/weather_few_clouds_zps15rdcb8r.png";
  } else if (cloudy.test(str)) {
    $("html").css("background", 'url("http://i358.photobucket.com/albums/oo27/picturesqueworlds/RJJ90FDT8W1_zpsrmayyrhq.jpg")' + "no-repeat center center fixed");
    return "http://i358.photobucket.com/albums/oo27/picturesqueworlds/cloudy_sky_zpsxhy1bryx.png";
  } else if (overcast.test(str)) {
    $("html").css("background", 'url("http://i358.photobucket.com/albums/oo27/picturesqueworlds/RJJ90FDT8W1_zpsrmayyrhq.jpg")' + "no-repeat center center fixed");
    return "http://i358.photobucket.com/albums/oo27/picturesqueworlds/overcast_sky_zpswnawzqgi.png";
  } else if (snow.test(str)) {
    $("html").css("background", 'url("http://i358.photobucket.com/albums/oo27/picturesqueworlds/XC9DW4IKVT_zps7unklljz.jpg")' + "no-repeat center center fixed");
    return "http://i358.photobucket.com/albums/oo27/picturesqueworlds/weather_snow_zpsg8xvcn2s.png";
  } else if (thunder.test(str)) {
    $("html").css("background", 'url("http://i358.photobucket.com/albums/oo27/picturesqueworlds/KLUGGEFXJ2_zpsi0zww9k5.jpg")' + "no-repeat center center fixed");
    return "http://i358.photobucket.com/albums/oo27/picturesqueworlds/weather_128_zpsolzwf8ov.png";
  } else {
    $("html").css("background", 'url("http://i358.photobucket.com/albums/oo27/picturesqueworlds/IUVI2VVDXJ_zpsh1zbooij.jpg")' + "no-repeat center center fixed");
    return "http://i358.photobucket.com/albums/oo27/picturesqueworlds/cloudy_sky_zpsxhy1bryx.png";
  }
}

function switchDeg(currentD) {
  var temp = $("#temperature").text();
  if (currentD === "F") {
    $("#temperature").text(((temp - 32) * (5 / 9)).toFixed(0));
    $("#degree").text("C");
  } else {
    $("#temperature").text((temp * 9 / 5 + 32).toFixed(0));
    $("#degree").text("F");
  }
}

var showIntroText = function(position, text, index, time) {
  $(position).append(text[index++]);
  setTimeout(function() {
    showIntroText(position, text, index, time);
  }, time);
}
