
var config = require('./config');

var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
var Twitter = require('twitter');
var Promise = require('bluebird');

var toneAnalyzer = new ToneAnalyzerV3(config.auth.watson.tone_analyzer);

var client = new Twitter(config.auth.twitter);

var getTweets = Promise.promisify(client.get, {context: client});
var getTone   = Promise.promisify(toneAnalyzer.tone, {context: toneAnalyzer});

getTweets('search/tweets', {q: 'cascadia16'})
  .then(function(tweets) {
    return tweets.statuses.reduce(function(p, c) {
      p.push(c.text);
      return p;
    }, []);
  })
  .then(function(tweets) {
    return Promise.all(tweets.map(function(t) {
      return getTone({text: t});
    }));
  })
  .then(function(toneResults) {
    console.log(toneResults);
    console.log(toneResults.length);
  });
