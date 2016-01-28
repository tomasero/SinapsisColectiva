var http = require('http'),
    twit = require('twit');


var readline = require('readline');
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

if (!process.env.TWITTER_CONSUMER_KEY) {
    var env = require('./env.js');
}

var T = new twit({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

function publish(message) {
    console.log(message);
    T.post('statuses/update', { status: message },  function(error, tweet, response) {
        if(error) throw error;
        console.log(tweet);  // Tweet body. 
        console.log(response);  // Raw response object. 
    });
}

rl.on('line', function(line) {
    publish(line);
});

var http = require('http');

var server = http.createServer(function(req, res) {
    res.writeHead(200);
    res.end('Sinapsis Colectiva');
});
server.listen(8080);
