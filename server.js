
var http = require('http'),
    twit = require('twit'),
    client = require('twilio')("ACf3e2774672baa3f68d9b80591c6667df", "1b9d6ce872a880a96e6c4293c52606fc"),
    express = require('express');

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
    });
}

rl.on('line', function(line) {
    publish(line);
});

function isPhoneNumber(element) {
    return element.match(/\d/g).length===10;
}

function sendMessage(from, msg) {
    var words = msg.split(" ");
    var to;
    if (isPhoneNumber(words[0]) == -1) {
        console.log("incorrecto");
        to = from;
        msg = "Wrong number format, please send just the 10 numbers";
    } else {
        to = "+1" + words[0];
        msg = words.splice(1, words.length).join(" ");
        publish(msg);
    }
    console.log("to: " + to);
    console.log("msg: " + msg);
    client.messages.create({ 
        to: to, 
        from: "+18556190666", 
        body: msg 
    }, function(err, message) { 
        if (err) console.log(err);
    });
    if (to == from) return;
    var response = 'Enviame la continuacion de la historia, incluyendo en el mensaje el numero de tu amigo que va a continuar la historia. No te olvides de agregar el hashtag!';
    setTimeout(function () {
        client.messages.create({ 
            to: to, 
            from: "+18556190666", 
            body: response 
        }, function(err, message) { 
            if (err) console.log(err);
        });
    }, 5000);
}

var app = express(),
    bodyParser = require('body-parser'),
app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.post('/incoming', function(req, res) {
    var data = req.body,
        from = data.From,
        msg = data.Body;
    console.log("from: " + from);
    console.log("msg: " + msg);
    var response = '<Response><Message>Gracias por contribuir al cadaver exquisito!</Message></Response>';
    sendMessage(from, msg);
    res.send(response);
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});

module.exports = app;
