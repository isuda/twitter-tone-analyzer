
var config = require('./config');

var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
var Twitter = require('twitter');
var Promise = require('bluebird');
var express = require('express');

var toneAnalyzer = new ToneAnalyzerV3(config.auth.watson.tone_analyzer);
var client = new Twitter(config.auth.twitter);
var app = express();


var getTweets = Promise.promisify(client.get, {context: client});
var getTone   = Promise.promisify(toneAnalyzer.tone, {context: toneAnalyzer});

app.use('/', express.static(__dirname + '/public'));
app.use('/scripts', express.static(__dirname + '/node_modules/chart.js/dist'));
app.use('/scripts', express.static(__dirname + '/node_modules/moment/min'));

app.get('/tone/:hashtag', function (req, res) {
  getTweets('search/tweets', {q: req.params.hashtag})
    .then(function(tweets) {
      return Promise.all(tweets.statuses.map(function(tweet, i) {
        return getTone({text: tweet.text})
                .then(function(tone) {
                  return {
                    text: tweet.text,
                    time: tweet.created_at,
                    tone: tone
                  };
                });
      }));
    })
    .then(function(toneResults) {
      res.json({results: toneResults});
    });
});

app.listen(config.port, function () {
  console.log('Express app listening on port '+config.port+'!');
});
