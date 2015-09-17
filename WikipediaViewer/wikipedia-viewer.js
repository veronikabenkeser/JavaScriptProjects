//Global variables
var interval2;
var parameters;
var scrollStartPos = 0;
var failedRequestObj1 = {
    batchcomplete: true
};
var failedRequestObj2 = {
    "batchcomplete": true
};

$(document).ready(function () {
    //Load all external js files
    var filesToLoad = [
        "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js", "https://cdnjs.cloudflare.com/ajax/libs/cytoscape/2.4.4/cytoscape.min.js", "http://marvl.infotech.monash.edu/webcola/cola.v3.min.js"
    ];
    var loader = new ScriptLoader();

    filesToLoad.forEach(function (url) {
        loader.add(url);
    });
    loader.loaded(function (returned) {
        console.log('Loaded!');
        initializeThisFile();
        $(".loader").fadeOut("slow");
    });

});

function ScriptLoader() {

    var promises = [];

    this.add = function (url) {
        var promise = new Promise(function (resolve, reject) {

            var script = document.createElement('script');
            script.src = url;

            script.addEventListener('load', function () {
                resolve(script);
            }, false);

            script.addEventListener('error', function () {
                reject(script);
            }, false);

            document.body.appendChild(script);
        });

        promises.push(promise);
    };

    this.loaded = function (callback) {
        Promise.all(promises).then(callback);
    };
}

function initializeThisFile() {
    var slidesTitleMap = {
        0: "Grand Prismatic Spring",
        1: "Snoqualmie Pass",
        2: "underwater museum",
        3: "Dead Vlei",
        4: "MareNostrum"
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
        style: 'node { shape: heptagon;  width: 60px; height:60px; text-valign: top; color: black; font-size: 10px; text-wrap: wrap; text-max-width: 90px; background-fit: cover; background-color: #FFF6A5; background-opacity:0.5; border-color: #E8D6A5; border-width: 2px; border-opacity: 1; } edge { width: 2; target-arrow-shape: triangle; opacity: 0.6; line-color: #3B7F41; target-arrow-color: #3B7F41; }',
        maxZoom: 3,
        userPanningEnabled: false,
        boxSelectionEnabled: false,

        ready: function () {
            window.cy = this;
            cy.on('tapdragover', 'node', function (evt) {
                var descr = this.data().description;
                if (descr !== "") {
                    this.css({
                        "content": descr
                    });
                }

                this.css({
                    "text-max-width": "100px",
                    "height": "100px",
                    "width": "100px",
                    "background-image-opacity": 0.5,
                    "text-valign": "center"
                });

                this.addClass('transfClass');

            });
            cy.on('tapdragout', 'node', function (evt) {
                this.css({
                    "text-max-width": "80px",
                    "height": "60px",
                    "width": "60px",
                    "background-image-opacity": 1,
                    "text-valign": "top",
                    "content": this.data().name
                });

                this.removeClass('transfClass');

            });

            $(document).on('touchstart', '.container', function (event) {
                scrollStartPos = event.originalEvent.touches[0].pageY;

            });

            $(document).on('touchmove', '.container', function (event) {
                $('html,body').scrollTop($(window).scrollTop() + (scrollStartPos - event.originalEvent.touches[0].pageY));

            });

            cy.on('tap', 'node', function (evt) {
                //take user to link
                this.css({
                    "text-max-width": "80px",
                    "height": "60px",
                    "width": "60px",
                    "background-image-opacity": 1,
                    "text-valign": "top",
                    "content": this.data().name
                });

                this.removeClass('transfClass');

                window.open(this.data().url);
            });
        }
    });

    $(window).on('resize', function () {
        drawToScale();
    });

    //Initialize google images 
    if (google) {
        google.load('search', '1', {
            callback: function () {
                // Need to do a callback in order for the page not to be blank.
            }
        });
    }

    //Seach box 
    $("#search .icon-container").click(function () {
        evaluateSearch();
    });

    //Search on enter
    $(".searchDiv").keyup(function (event) {
        if (event.keyCode == 13) {

            evaluateSearch();
        }
    });

    //Random button
    $("#rand-button").click(function () {

        moveDown();
        //Generate graph
        generateRandomGraph();
    });

    //Green search button
    $(".green-search").click(function () {
        //Get current slide
        var searchT = $(this).attr('id');
        moveDown();
        findConcept(searchT);
    });
}

// Create an observer that notes when the slides change. It will be used for
//typing text.
function assignObserver(target, config, slidesTitleMap) {
    var i = 1;
    var observer = new MutationObserver(function (mutations) {

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

    interval2 = window.setInterval(function () {
        cursorAnimation($cursorObj);
    }, 900);

    //Type text
    var $position = $obj.find('.typed-text');
    window.setTimeout(function () {
        typeTitle($position, textToType, 0, 200);
    }, 4000);
}

function cursorAnimation($obj) {
    $obj.css('display', "none");
    setTimeout(function () {
        $obj.css('display', "")
    }, 500);
}

function typeTitle(position, text, index, time) {
    $(position).append(text[index]);
    index++;
    setTimeout(function () {
        typeTitle(position, text, index, time);
    }, time);
}

//Animated scrolling
function scrollToElement(el, ms) {
    var speed = (ms)
        ? ms
        : 600;
    $('html,body').animate({
        scrollTop: $(el).offset().top
    }, speed);
}

//Concept map
function generateRandomGraph() {
    if (cy !== 'undefined') {
        cy.nodes().remove();
        cy.edges().remove();
    }
    generateTermWithLinks();
}

function generateTermWithLinks() {

    parameters = {
        "action": "query",
        "prop": "images|info|pageimages|pageterms|links|extracts",
        "exchars": 100,
        "explaintext": "",
        "format": "json",
        "inprop": "url",
        "formatversion": 2,
        "plnamespace": 0,
        "pllimit": 2,
        "wbptterms": "description",
        "uselang": "en",
        "piprop": "thumbnail",
        "pithumbsize": 150,
        "pilimit": 1,
        "generator": "random",
        "grnnamespace": 0,
        "grnlimit": 1,
        "redirects": ""
    };

    //Generate a random page. When done, get info(inluding links, thumnail, etc)
    //from all of the pages that the random page links to.
    getLinksFromPage(parameters);
}

//Generate a page. When done, get info(inluding links, thumnail, etc) from all
//of the pages that the random page links to.
function getLinksFromPage(parameters) {

    getData(parameters).done(function (data, textStatus, xhr) {
        var termObj = data;

        //If the search did not generate any results, show an error message
        if (JSON.stringify(termObj) === JSON.stringify(failedRequestObj1) || JSON.stringify(termObj) === JSON.stringify(failedRequestObj2)) {

            generateTermWithLinks();

        } else {
            if (wikiPageHasInfo(data.query.pages[0]) && data.query.pages[0].links) {
                var comboSearchTitle = generatedTitleCombo(data.query.pages[0].links);

                findAndMapSubterms(comboSearchTitle, termObj, 3, countNodesCallback);
            }
        }

    }).fail(function (error) {
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

    // Get pages for all of those links
    for (var i = 0; i < links.length; i++) {
        if (i !== links.length - 1) {
            str += links[i].title + "|";
        } else {
            str += links[i].title;
        }
        console.log("string to search:" + str);
    }
    return str;
}

function getSubpagesOfSubpages(subnodes, parent) {

    //Go through some of the links of the subpages, get their info (inluding links,
    //thumnail, etc) and draw the sublinks linked to their parent
    subnodes.forEach(function (subnode) {
        if (cy && cy.nodes().size < 14 && subnode.data.links !== "") {
            //Go through each of the links and draw that link's thumbnail, get links, etc.
            var linksArr = subnode.data.links;
            linksArr.forEach(function (linkObj) {});
        }
    });
}

function findAndMapSubterms(searchTerm, parentTermObj, numToFind, callbackF) {
    if (typeof callbackF === 'undefined') {
        callbackF = "";
    }

    var parentNode;
    var nodes;

    parameters = {
        "action": "query",
        "prop": "images|info|pageimages|pageterms|links|extracts",
        "exchars": 100,
        "explaintext": "",
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
        "pilimit": 1
    };
    getData(parameters).done(function (data, textStatus, xhr) {
        var nodes = makeNodes(data, textStatus, xhr);
        var parentNode;

        if (typeof parentTermObj.query !== 'undefined') { //not a cytoscape obj yet
            parentNode = makeNodes(parentTermObj)[0];

        } else { //is a cytoscape obj yet
            parentNode = parentTermObj; //the parent is already a node

        }

        //If there was at least one child node drawn and there is an exisiting parent
        //node, then connect all of the child nodes to the parent. If not, do another
        //random search.
        if (nodes && parentNode) {
            makeEdges(nodes, parentNode);
        } else {
            console.log("FOUND BLANK PAGES. DOING ANOTHER RANDOM SEARCH.");
            generateTermWithLinks();
        }
        console.log("current count of nodes: " + cy.nodes().size());

        if (typeof callbackF === "function") {
            callbackF(cy.nodes().size(), nodes);
        }
    }).fail(function (error) {
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
    var needToAdd = true;

    var results = [];
    var tempArr = [];
    var node;
    var edge;
    var thumbnail;

    for (var key in data) {

        //If the Wikipedia page is not empty, create a new node
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
            cy.nodes().forEach(function (ele) {
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

    nodes.forEach(function (node) {
        var lab = node[0]._private.data.name;
        node.css({
            "content": lab
        });
    });
}

function populateAllImages(nodes) {
    //Go through all of the nodes and assign an image to each one.
    //var nodes = cy.nodes();

    nodes.forEach(function (node) {
        if (node.data('thumbnail') !== "") {
            var pic = node.data('thumbnail');

            imageExists(pic, function (pic, result) {
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

///function testImage(url, callback, timeout) {
function imageExists(url, callback, timeout) {

    timeout = timeout || 5000;
    var timedOut = false,
        timer;
    var img = new Image();
    img.onerror = img.onabort = function () {
        if (!timedOut) {
            clearTimeout(timer);

            callback(url, "error");
        }
    };
    img.onload = function () {
        if (!timedOut) {
            clearTimeout(timer);

            callback(url, "success");
        }
    };
    img.src = url;
    timer = setTimeout(function () {
        timedOut = true;

        callback(url, "timeout");
    }, timeout);

}

function countNodesCallback(numOfNodes, nodesArr) {

    var maxNum = 8 - numOfNodes;
    var count = 0;
    var subArr = [];

    //Put nodes that have links into a subArr
    nodesArr.forEach(function (node) {
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
                if (count >= 6) 
                    break;
            }

            var searchTerm = generatedTitleCombo(lastToBeFetched.data.links);
            findAndMapSubterms(searchTerm, lastToBeFetched, 2, countNodesCallback);
        } else {
            var nodes = cy.nodes();
            populateAllImages(nodes);
            labelNodes(nodes);
            drawToScale();
            console.log("DONT NEED TO RUN AGAIN");
        }

    } else {
        //If there are no drawn nodes that have sublinks, then generate a new random
        //term.
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

        /*fit: true,*/
        // on every layout reposition of nodes, fit the viewport
        padding: 1, // padding around the simulation
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }

        // layout event callbacks
        ready: function () {}, // on layoutready
        stop: function () {}, // on layoutstop

        // positioning options
        randomize: true, // use random node positions at beginning of layout
        avoidOverlap: true, // if true, prevents overlap of node bounding boxes
        handleDisconnected: true, // if true, avoids disconnected components from overlapping
        nodeSpacing: function (node) {
            /* return 15;*/
            return 25;
        }, // extra spacing around nodes
        flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
        alignment: undefined, // relative alignment constraints on nodes, e.g. function( node ){ return { x: 0, y: 1 } }

        // different methods of specifying edge length  each can be a constant numerical
        //value or a function like `function( edge ){ return 2;
        //}`
        edgeLength: undefined, // sets edge length directly in simulation
        edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
        edgeJaccardLength: undefined, // jaccard edge length in simulation

        // iterations of cola algorithm; uses default values on undefined
        unconstrIter: undefined, // unconstrained initial layout iterations
        userConstIter: undefined, // initial layout iterations with user-specified constraints
        allConstIter: undefined, // initial layout iterations with all constraints including non-overlap
        infinite: false // overrides all other options for a forces-all-the-time mode
    };

    cy.layout(options);
    window.cy.layout();
    var bounds = cy.elements().boundingBox();
    $('#cy').css('height', bounds.h + 300);
    /*cy.boxSelectionEnabled(false);*/
    cy.center();
    cy.resize();
}

function wikiPageHasInfo(page) {
    if (page.missing) {
        return false;
    }
    return true;
}

function findConcept(searchTerm) {
    $("#errorM").empty();
    if (cy !== 'undefined') {
        cy.nodes().remove();
        cy.edges().remove();
    }

    parameters = {
        "action": "query",
        "titles": searchTerm,
        "formatversion": 2,
        "prop": "images|info|pageimages|pageterms|links|extracts",
        "exchars": 100,
        "explaintext": "",
        "format": "json",
        "inprop": "url",
        "generator": "search",
        "redirects": "",
        "piprop": "thumbnail",
        "pithumbsize": 200,
        "pilimit": 10,
        "pllimit": 10,
        "wbptterms": "description",
        " uselang": "en",
        "gsrsearch": searchTerm,
        "gsrnamespace": 0
    };
    populateSearchTermResults(parameters);
}

function populateSearchTermResults(parameters) {

    getData(parameters).done(function (data, textStatus, xhr) {

        if (JSON.stringify(data) === JSON.stringify(failedRequestObj1) || JSON.stringify(data) === JSON.stringify(failedRequestObj2)) {
            displayErrorMessage(parameters.gsrsearch);
            attemptToGuessSearchTerm(parameters.gsrsearch);
        } else {

            showSearchBoxResults(data, textStatus, xhr, true);
        }
    });
}

function attemptToGuessSearchTerm(typedSearchTerm) {

    parameters = {
        "action": "query",
        "prop": "images|info|pageimages|pageterms|extracts",
        "exchars": 100,
        "explaintext": "",
        "format": "json",
        "inprop": "url",
        "pilimit": 1,
        "wbptterms": "description",
        "generator": "allpages",
        "gapfrom": typedSearchTerm,
        "gaplimit": 10
    };

    getData(parameters).done(function (data, textStatus, xhr) {
        if (JSON.stringify(data) === JSON.stringify(failedRequestObj1) || JSON.stringify(data) === JSON.stringify(failedRequestObj2)) {

            $("#cy").append("Your search \"" + searchedText + "\" did not match any Wikipedia entries.");
        } else {

            showSearchBoxResults(data, textStatus, xhr, false);
        }
    });
}

function displayErrorMessage(searchedText) {
    $message = $('<div class= "errorM"></div>');
    $message.append("Your search \"" + searchedText + "\" did not match any Wikipedia entries. Did you mean to search for any of the following?");
    $("#errorM").append($message);
}

function showSearchBoxResults(data, textStatus, xhr, showConnections) {
    var nodes = makeNodes(data, textStatus, xhr);
    var parent = nodes[0];
    nodes.splice(0, 1);

    if (showConnections) {
        makeEdges(nodes, parent);
        console.log("making edges");
    } else {
        increaseSizeOfIcons();
    }

    var existingNodes = cy.nodes();
    populateAllImages(existingNodes);
    labelNodes(existingNodes);

    drawToScale();
}

function moveDown() {

    $("#cy").css("height", window.innerHeight - 20);

    //Scroll to section
    $('html, body').stop().animate({
        scrollTop: $("#cy").offset().top
    }, "slow");
}

function evaluateSearch() {
    var searchTerm = $('#searchT').val();
    if (searchTerm) {
        moveDown();
        findConcept(searchTerm);
    }
}

function increaseSizeOfIcons() {
    cy.nodes().css({
        "text-max-width": "160px",
        "shape": "roundrectangle"
    });
}
