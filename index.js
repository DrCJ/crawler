const request = require('request');
const cheerio = require('cheerio');
const url = require('url-parse');

const maxSearchDepth = 0;

const espnDict = [
  {
    root: 'atl', filter: [/^\/blog\/atlanta-falcons/],
    allRelativeLinks: {}
  },
  {
    root: 'car', filter: [/^\/blog\/carolina-panthers/],
    allRelativeLinks: {}
  },
];

const fetchTeamRoot = (i) => {
  const espnTeamPrefix = 'http://www.espn.com/nfl/team/_/name/';
  const teamData = espnDict[i];
  const searchDepth = 0;
  requestCrawl(espnTeamPrefix + teamData.root, teamData.filter, searchDepth);
}

const requestCrawl = (crawlUrl, filter, searchDepth) => {
  console.log('crawlUrl:', crawlUrl);

  request(crawlUrl, function(error, response, body) {
     if(error) {
       console.log("Error: " + error);
     }
    // Check status code (200 is HTTP OK)
    console.log("Status code: " + response.statusCode);
    if(response.statusCode === 200) {

      var $ = cheerio.load(body);
      console.log("Page title:  " + $('title').text());

      var results = $('.gsc-resultsRoot');
      collectInternalLinks($, filter, searchDepth);
    }
  });
}

const getNextFetch = (depth) => {
  
}

function collectInternalLinks($, filter, searchDepth) {
  var allRelativeLinks = {};

  var relativeLinks = $("a[href^='/']");
  relativeLinks.each(function() {
    var link = $(this).attr('href');
    for (var i = 0; i < filter.length; i++) {
      if (!allRelativeLinks[link] && filter[i].test(link)) {
        allRelativeLinks[link] = searchDepth + 1;
      }
    }
  });

  // var absoluteLinks = $("a[href^='http']");

  console.log("Found " + allRelativeLinks.length + " relative links");
  console.log(allRelativeLinks);
  if (searchDepth < maxSearchDepth) {
    // getNextFetch(searchDepth + 1)

  }
}

var currentTeam = 0;
fetchTeamRoot(currentTeam);