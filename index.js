const request = require('request');
const cheerio = require('cheerio');
const url = require('url-parse');
const { objectToArray } = require('./utils');
const Promise = require('bluebird');

const maxSearchDepth = 0;

const promiseRequest = (url) => {
  return new Promise((resolve, reject) => {
    request(url, (err, response, body) => {
      if (err) {
        reject(err);
      } else {
        if(response.statusCode === 200) {
          resolve(body);
        } else {
          reject(response);
        }
      }
    });
  });
};

const fetchAllTeams = () => {
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

  //to do all teams
  var team = 0;
  const doFetch = () => {
    fetchTeamLinksUntilDone(espnDict[team], () => {
      team++;
      if (team < espnDict.length) {
        doFetch();
      }
    });
  }
  doFetch();
};

const fetchTeamLinksUntilDone = (obj, cb) => {
  var fetchObject = {
    count: 1,
    urls: {
      // thisUrl: {depth: 0, fetched: false},
    },
    filter: obj.filter,
    maxDepth: 1
  }

  const espnTeamPrefix = 'http://www.espn.com/nfl/team/_/name/';
  const rootUrl = espnTeamPrefix + obj.root;
  fetchObject.urls[rootUrl] = {depth: 0, fetched: false};
  // const delay = 2000;

  const fetchLinkHelper = (url) => {
    requestCrawl(url, fetchObject)
      .then(result => {
        console.log('result:', fetchObject);
        fetchObject = result;
        if (fetchObject.count > 0) {
          //get next url
          const urls = fetchObject.urls;
          var nextUrl;
          for (var url in urls) {
            if (!urls[url].fetched && urls[url].depth <= fetchObject.maxDepth) {
              nextUrl = url;
            }
          }
          
          if (nextUrl) {
            // setTimeout(() => { fetchLinkHelper(nextUrl) }, delay);
            fetchLinkHelper(nextUrl);
          } else {
            console.log('no more urls in depth range!!!!');
            cb();
          }
        } else {
          console.log('all team links fetched');
          cb();
        }
      });
  };

  fetchLinkHelper(rootUrl);
};

const requestCrawl = (crawlUrl, fetchObject) => {
  console.log('crawlUrl:', crawlUrl);
  fetchObject.urls[crawlUrl].fetched = true;
  fetchObject.count--;
  var thisDepth = fetchObject.urls[crawlUrl].depth;

  return promiseRequest(crawlUrl)
    .then(body => {
      var $ = cheerio.load(body);
      console.log("Page title:  " + $('title').text());

      var results = $('.gsc-resultsRoot');
      return collectInternalLinks($, fetchObject, thisDepth);
    });
}

const collectInternalLinks = ($, fetchObject, searchDepth) => {
  const filter = fetchObject.filter;

  var allRelativeLinks = fetchObject.urls;

  var relativeLinks = $("a[href^='/']");
  relativeLinks.each(function() {
    var link = $(this).attr('href');
    for (var i = 0; i < filter.length; i++) {
      if (!allRelativeLinks[link] && filter[i].test(link)) {
        allRelativeLinks[`http://www.espn.com${link}`] = { depth: searchDepth + 1, fetched: false };
        if (searchDepth < fetchObject.maxDepth) {
          fetchObject.count++;
        }
      }
    }
  });

  return fetchObject;
}

fetchAllTeams();
