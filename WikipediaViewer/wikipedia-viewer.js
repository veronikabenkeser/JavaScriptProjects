//Global variables
var interval2;

$(document).ready(function() {
  //Load all external js files
  var filesToLoad = ["https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js", "https://cdnjs.cloudflare.com/ajax/libs/cytoscape/2.4.4/cytoscape.min.js", "http://marvl.infotech.monash.edu/webcola/cola.v3.min.js"];
  var loader = new ScriptLoader();

  filesToLoad.forEach(function(url) {
    loader.add(url);
  });
  loader.loaded(function(returned) {
    console.log('Loaded!');
    initializeThisFile();
  });
});

function ScriptLoader() {

  var promises = [];

  this.add = function(url) {
    var promise = new Promise(function(resolve, reject) {

      var script = document.createElement('script');
      script.src = url;

      script.addEventListener('load', function() {
        resolve(script);
      }, false);

      script.addEventListener('error', function() {
        reject(script);
      }, false);

      document.body.appendChild(script);
    });

    promises.push(promise);
  };

  this.loaded = function(callback) {
    Promise.all(promises).then(callback);
  };
}

function initializeThisFile() {
  var slidesTitleMap = {
    0: "MareNostrum",
    1: "Sunset",
    2: "Snoqualmie Pass"
  };

  //Configurations for the Mutation Observer
  var config = {
    attributes: true,
    childList: false,
    characterData: false,
    subtree: true,
    attributeFilter: ['class']
  };
  //Mutation Observer initialization
  var $target = $('.carousel-inner')[0];
  assignObserver($target, config, slidesTitleMap);

  //Add typed text and cursor to the first slide
  addTextToSlides(slidesTitleMap);

  //Initialize concept map
  $('#cy').cytoscape({
    container: document.getElementById('cy'),
    style: 'node { shape: rhomboid;  width: 120px; height:120px; text-valign: top; color: black; font-size: 20px; text-wrap: wrap; text-max-width: 200px;  font-weight: bold;  background-fit: cover; background-color: #FFF6A5; background-opacity:0.5; border-color: #E8D6A5; border-width: 2px; border-opacity: 1; } edge { width: 6; target-arrow-shape: triangle; line-color: #3B7F41; target-arrow-color: #3B7F41; } .transfClass{color:red;}',
    ready: function() {
      window.cy = this;
      cy.on('tapdragover', 'node', function(evt) {
        this.css({
          "content": "_ "
        });
        var descr = this.data().description;
        this.addClass('transfClass');
        this.css({
          "text-max-width": "190px",
          "height": "200px",
          "width": "200px",
          "background-image-opacity": 0.5,
          "content": descr
        });

        $(".box").append(this.data().description);

      });
      cy.on('tapdragout', 'node', function(evt) {
        $(".box").empty();
        this.css({
          "text-max-width": "140px",
          "height": "100px",
          "width": "100px",
          "background-image-opacity": 1,
          "content": this.data().name,
          "text-max-width": "90px"
        });
        this.removeClass('transfClass');

      });

      cy.on('tap', 'node', function(evt) {
        //take user to link
        window.open(this.data().url);
      });
    }
  });

  $(window).on('resize', function() {
    drawToScale();
  });

  //Initialize google images 
  if (google) {
    google.load('search', '1', {
      callback: function() {
        // Need to do a callback in order for the page not to be blank.
      }
    });
  }

  //Seach box 
  $("#search").click(function() {
    findConcept();
  });

  //Random button
  $("#rand-button").click(function() {

    /*scrollToElement('#cy', 600);*/
    generateRandomGraph();
  });
}

// Create an observer that notes when the slides change. It will be used for typing text.
function assignObserver(target, config, slidesTitleMap) {
  var i = 1;
  var observer = new MutationObserver(function(mutations) {
    if (i % 2 === 0) {
      clearInterval(interval2);
      //Empty the text field
      $(".carousel-inner .item .typed-text").empty();

      //Add text and cursor
      addTextToSlides(slidesTitleMap);
    }
    i++;
  });
  observer.observe(target, config);
}

function addTextToSlides(slidesTitleMap) {
  var $obj = $(".carousel-inner .active");
  var indexOfCurentSlide = $obj.index();
  var textToType = slidesTitleMap[indexOfCurentSlide];

  //Show blinker
  var $cursorObj = $obj.find('.cursor');
  interval2 = window.setInterval(function() {
    cursorAnimation($cursorObj);
  }, 900);

  //Type text
  var $position = $obj.find('.typed-text');
  window.setTimeout(function() {
    typeTitle($position, textToType, 0, 200);
  }, 4000);
}

function cursorAnimation($obj) {
  $obj.css('display', "none");
  setTimeout(function() {
    $obj.css('display', "")
  }, 500);
}

function typeTitle(position, text, index, time) {
  $(position).append(text[index]);
  index++;
  setTimeout(function() {
    typeTitle(position, text, index, time);
  }, time);
}

//Animated scrolling
function scrollToElement(el, ms) {
  var speed = (ms) ? ms : 600;
  $('html,body').animate({
    scrollTop: $(el).offset().top
  }, speed);
}

//Concept map
function generateRandomGraph() {
  /*$("#cy").empty();*/
  if (cy !== 'undefined') {
    cy.nodes().remove();
    cy.edges().remove();
  }
  generateTermWithLinks();
}

function generateTermWithLinks() {

  var parameters = {
    "action": "query",
    "prop": "images|info|pageimages|pageterms|links",
    "format": "json",
    "inprop": "url",
    "formatversion": 2,
    "plnamespace": 0,
    "pllimit": 2,
    "wbptterms": "description",
    " uselang": "en",
    "piprop": "thumbnail",
    "pithumbsize": 150,
    "pilimit": 1,
    "generator": "random",
    "grnnamespace": 0,
    "grnlimit": 1,
    "redirects": ""
  };

  //Generate a random page. When done, get info(inluding links, thumnail, etc) from all of the pages that the random page links to.
  getData(parameters).done(function(data, textStatus, xhr) {
    var randomTermObj = data;
    if (wikiPageHasInfo(data.query.pages[0]) && data.query.pages[0].links) {
      var comboSearchTitle = generatedTitleCombo(data.query.pages[0].links);
      findAndMapSubterms(comboSearchTitle, randomTermObj, 3, countNodesCallback);

    } else {
      generateTermWithLinks();
    }

  }).fail(function(error) {
    throw new Error("Error getting the data inside of the populateRandom function");
  });
}

function getData(parameters) {
  return $.ajax({
    type: "GET",
    data: parameters,
    url: "https://en.wikipedia.org/w/api.php",
    dataType: "jsonp"
  });
}

function generatedTitleCombo(links) {
  var str = "";

  // get pages for all of those links
  for (var i = 0; i < links.length; i++) {
    if (i !== links.length - 1) {
      str += links[i].title + "|";
    } else {
      str += links[i].title;
    }
    console.log("string to search" + str);
  }
  return str;
}

function getSubpagesOfSubpages(subnodes, parent) {
  //Go through some of the links of the subpages, get their info (inluding links, thumnail, etc) and draw the sublinks linked to their parent
  subnodes.forEach(function(subnode) {
    if (cy && cy.nodes().size < 14 && subnode.data.links !== "") {
      //Go through each of the links and draw that link's thumbnail, get links, etc.
      var linksArr = subnode.data.links;
      linksArr.forEach(function(linkObj) {
      });
    }
  });
  //The number of drawn subnodes is still less than 14.
  console.log("The total number of nodes is still less than 14. Num of nodes : " + cy.nodes().size);
}

function conductSearch(searchTerm) {
  console.log("Inside of the conductSearch function");
}

function findAndMapSubterms(searchTerm, parentTermObj, numToFind, callbackF) {
  if (typeof callbackF === 'undefined') {
    callbackF = "";
  }

  var parentNode;
  var nodes;

  var parameters = {
    "action": "query",
    "prop": "images|info|pageimages|pageterms|links",
    "format": "json",
    "inprop": "url",
    "formatversion": 2,
    "titles": searchTerm,
    "plnamespace": 0,
    "pllimit": numToFind,
    "wbptterms": "description",
    " uselang": "en",
    "piprop": "thumbnail",
    "pithumbsize": 150,
    "pilimit": 1,
  };
  getData(parameters).done(function(data, textStatus, xhr) {
    var nodes = makeNodes(data, textStatus, xhr);
    var parentNode;
    if (typeof parentTermObj.query !== 'undefined') { //not a cytoscape obj yet
      parentNode = makeNodes(parentTermObj)[0];

    } else { //is a cytoscape obj yet
      parentNode = parentTermObj; //the parent is already a node
    }

    //If there was at least one child node drawn and there is an exisiting parent node, then connect all of the child nodes to the parent. If not, do another random search.
    if (nodes && parentNode) {
      makeEdges(nodes, parentNode);
    } else {
      generateTermWithLinks();
    }

    if (typeof callbackF === "function") {
      console.log("in the callbackF now");
      callbackF(cy.nodes().size(), nodes);
    }
    //return [nodes, parentNode];
  }).fail(function(error) {
    throw new Error("Error getting the data inside of the findAndMapSubterms function");
  });
}

function makeEdges(nodes, parentTerm) {
  //parentTerm var is a cytoscape obj
  for (var i = 0; i < nodes.length; i++) {
    edge = {
      group: "edges",
      data: {
        source: parentTerm.data.id,
        target: nodes[i].data.id
      }
    };
    cy.add(edge);
  }
}

function makeNodes(data, textStatus, xhr) {
  var data = data.query.pages;
  var title;
  var url;
  var haspic;
  var pic;
  var desc;
  var links;
  var index;
  var tempPos = 100;
  /*var i = 0;
  var original = i;*/
  var needToAdd = true;

  var results = [];
  var tempArr = [];
  var node;
  var edge;
  var thumbnail;

  for (var key in data) {

    //If the Wikipedia page is not empty
    if (wikiPageHasInfo(data[key])) {

      title = data[key].title;
      url = data[key].fullurl;
      haspic = data[key].thumbnail;

      if (data[key].terms && data[key].terms.description) {
        desc = data[key].terms.description;
      } else {
        desc = "";
      }

      if (data[key].links) {
        links = data[key].links;
      } else {
        links = "";
      }

      if (haspic) {
        thumbnail = data[key].thumbnail.source;
      } else {
        thumbnail = "";
      }

      node = {
        group: "nodes",
        data: {
          links: links,
          url: url,
          thumbnail: thumbnail,
          description: desc,
          name: title
        },
        position: {
          x: tempPos,
          y: tempPos
        }
      };

      //Check for repeats

      cy.nodes().forEach(function(ele) {
        if (ele.data('name').toLowerCase() === node.data.name.toLowerCase()) {
          needToAdd = false;
        }
      });

      if (needToAdd) {
        results.push(node);

        cy.add(node);
      }
      tempPos += 100;
    }
  }
  return results;
}

function labelNodes(nodes) {

  nodes.forEach(function(node) {
    var lab = node[0]._private.data.name;
    var labW = lab.length - 10;
    node.css({
      "content": lab,
      /*"text-max-width": labW*/
    });
  });

}

function populateAllImages(nodes) {
  //Go through all of the nodes and assign an image to each one.
  //var nodes = cy.nodes();

  nodes.forEach(function(node) {
    if (node.data('thumbnail') !== "") {
      var pic = node.data('thumbnail');

      imageExists(pic, function(pic, result) {
        if (result === "success") {
          node.css('background-image', pic);
        } else {
          addGoogleImage(node.data('name'), node);
        }

      });
    } else {
      addGoogleImage(node.data('name'), node);
    }

  });
}

function addGoogleImage(searchTerm, imageReceiver) {
  var pic;
  var imageSearch;
  // Create an Image Search instance.
  imageSearch = new google.search.ImageSearch();

  // Set searchComplete as the callback function when a search is 
  // complete.  The imageSearch object will have results in it.

  imageSearch.setSearchCompleteCallback(this, searchComplete, null);
  // imageSearch.setResultSetSize(1);

  // Find me a beautiful car.
  imageSearch.execute(searchTerm);
  console.log("just did a google search.");

  // Include the required Google branding
  google.search.Search.getBranding('branding');

  function searchComplete() {
    // Check that we got rfesults
    if (imageSearch.results && imageSearch.results.length > 0) {
      //  check that image is available
      var q = 0;

      function cb(url, result) {
        if (result === "success") {
          imageReceiver.css('background-image', url);

        } else {
          if (q < imageSearch.results.length - 1) {
            q++;
            var k = imageSearch.results;
            imageExists(imageSearch.results[q].url, cb);
          } else {
            console.log("No more google results. Out of imageSearch.results.length :" + imageSearch.results.length);
          }
        }
      }
      imageExists(imageSearch.results[q].url, cb);
    }
  }
}

function imageExists(url, callback, timeout) {
  timeout = timeout || 5000;
  var timedOut = false,
    timer;
  var img = new Image();
  img.onerror = img.onabort = function() {
    if (!timedOut) {
      clearTimeout(timer);
      callback(url, "error");
    }
  };
  img.onload = function() {
    if (!timedOut) {
      clearTimeout(timer);
      callback(url, "success");
    }
  };
  img.src = url;
  timer = setTimeout(function() {
    timedOut = true;
    callback(url, "timeout");
  }, timeout);

}

function countNodesCallback(numOfNodes, nodesArr) {

  var maxNum = 8 - numOfNodes;
  var count = 0;
  var subArr = [];

  //Put nodes that have links into a subArr
  nodesArr.forEach(function(node) {
    if (node.data.links !== "") {
      subArr.push(node);
    }
  });

  if (subArr.length !== 0) {
    var lastToBeFetched = subArr[subArr.length - 1];

    //If the number of drawn nodes is < 8 ,keep fetching subnodes.
    if (numOfNodes < 8) {

      for (var i = 0; i < subArr.length - 1; i++) {
        var linksArr = subArr[i].data.links;
        var comboSearchTerm = generatedTitleCombo(linksArr);
        findAndMapSubterms(comboSearchTerm, subArr[i], 2);
        count += 2;
        if (count >= 6) break;
      }

      var searchTerm = generatedTitleCombo(lastToBeFetched.data.links);
      findAndMapSubterms(searchTerm, lastToBeFetched, 2, countNodesCallback);
    } else {
      var nodes = cy.nodes();
      populateAllImages(nodes);
      labelNodes(nodes);
      drawToScale();
      console.log("Don't need to run again.");
    }

  } else {
    //If there are no drawn nodes that have sublinks, then generate a new random term.
    generateTermWithLinks();
  }
}

function drawToScale() {
  var boundingH = window.innerWidth - 10;
  var boundingW = window.innerHeight - 10;

  var options = {
    name: 'cola',

    animate: true, // whether to show the layout as it's running
    refresh: 0.5, // number of ticks per frame; higher is faster but more jerky
    maxSimulationTime: 6000, // max length in ms to run the layout
    ungrabifyWhileSimulating: false, // so you can't drag nodes during layout

    /*fit: true,*/ // on every layout reposition of nodes, fit the viewport
    padding: 0, // padding around the simulation
    boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }

    // layout event callbacks
    ready: function() {}, // on layoutready
    stop: function() {}, // on layoutstop

    // positioning options
    randomize: true, // use random node positions at beginning of layout
    avoidOverlap: true, // if true, prevents overlap of node bounding boxes
    handleDisconnected: true, // if true, avoids disconnected components from overlapping
    nodeSpacing: function(node) {
      return 30;
    }, // extra spacing around nodes
    flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
    alignment: undefined, // relative alignment constraints on nodes, e.g. function( node ){ return { x: 0, y: 1 } }

    // different methods of specifying edge length
    // each can be a constant numerical value or a function like `function( edge ){ return 2; }`
    edgeLength: undefined, // sets edge length directly in simulation
    edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
    edgeJaccardLength: undefined, // jaccard edge length in simulation

    // iterations of cola algorithm; uses default values on undefined
    unconstrIter: undefined, // unconstrained initial layout iterations
    userConstIter: undefined, // initial layout iterations with user-specified constraints
    allConstIter: undefined, // initial layout iterations with all constraints including non-overlap

    // infinite layout options
    infinite: false // overrides all other options for a forces-all-the-time mode
  };

  cy.layout(options);
  window.cy.layout();
  var bounds = cy.elements().boundingBox();
  $('#cy').css('height', bounds.h + 300);
  cy.center();
  cy.resize();
  //fix the Edgehandles
  $('#cy').cytoscapeEdgehandles('resize');
  /*cy.zoom(1.5);
   cy.center();*/
}

function wikiPageHasInfo(page) {
  if (page.missing) {
    return false;
  }
  return true;
}
