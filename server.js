var http = require('http'),
    twit = require('twit'),
    client = require('twilio')("ACf3e2774672baa3f68d9b80591c6667df", "1b9d6ce872a880a96e6c4293c52606fc"),
    express = require('express'),
    utf8 = require('utf8'),
    querystring = require('querystring'),
    unidecode = require('unidecode');

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

var sinapsisNumber = "+18556190666";

function publish(message, callback) {
    T.post('statuses/update', { status: message },  function(error, tweet, response) {
        if (error) {
            console.log("error: " + error);
            console.log("error.statusCode: " + error.statusCode);
            if (error.statusCode == 403) {
                if (error.message == "Status is a duplicate.") {
                    callback("duplicate"); 
                }
            } else {
                throw error;
            }
        } else {
            callback(false);
        }
    });
}

rl.on('line', function(line) {
    publish(line);
});

function isPhoneNumber(element) {
    try {
        return element.match(/\d/g).length===10;
    } catch (err) {
        return -2;
    }
}

function sendSMS(from, to,  msg) {
    client.messages.create({ 
        to: to, 
        from: from, 
        body: msg 
    }, function(err, message) { 
        if (err) console.log(err);
    });

}

function sendMessage(from, msg, res) {
    var words = msg.split(" ");
    var to;
    var errTo = from;
    isPhoneCorrect = isPhoneNumber(words[0]);
    if (isPhoneCorrect == -1) {
        msg = "Formato de número incorrecto, solo manda 10 números";
        sendSMS(sinapsisNumber, errTo, msg);
    } else if (isPhoneCorrect == -2) {
        msg = "Asegúrate de incluir un número primero";
        sendSMS(sinapsisNumber, errTo, msg);
    } else {
        to = "+1" + words[0];
        msg = words.splice(1, words.length).join(" ");
        if (msg.length > 140) {
            msg = msg.substring(0, 140);
            errMsg = "Tu mensaje ha sido recortado a 140 caracteres!!";
            sendSMS(sinapsisNumber, errTo, errMsg);
        }
        publish(msg, function (error) {
            if (error == "duplicate") {
                to = from;
                msg = "No mandes duplicados!!";
                sendSMS(sinapsisNumber, to, msg);
            } else {
                var response = '<Response><Message>Gracias por contribuir al cadaver exquisito!</Message></Response>';
                res.send(response);
                sendSMS(sinapsisNumber, to, msg);
                msg = 'Envíame la continuacion de la historia en el siguiente formato: [Numero de telefono  (solo 10 dígitos)] #hashtag [Continuación de la historia]';
                setTimeout(function () {
                    sendSMS(sinapsisNumber, to, msg);                
                }, 500);
            }
        });
    }
}

var app = express(),
    bodyParser = require('body-parser'),
app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

/**
app.use(function(req, res, next) {
    req.setEncoding('utf8');
});
*/
app.post('/incoming', function(req, res) {
    //req.setEncoding('utf8');
    var data = req.body,
        from = data.From,
        msg = data.Body;
    console.log("from: " + from);
    console.log("msg: " + utf8.decode(msg));
    console.log(unidecode(msg));
    sendMessage(from, msg, res);
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});

module.exports = app;
