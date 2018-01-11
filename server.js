var express = require('express')
var app = express();
var fs = require('fs');


//----------------MONGO DB -----------------------------------//

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var mongoURL = 'mongodb://localhost:27017/test';


//---------------- WATSON SERVICES INITIALIZATION ------------//

var watson = require('watson-developer-cloud');
var conversationID = "";
var responseMessage;

var conversation = watson.conversation({
  username: '44bb53b2-5278-48cc-bd6c-01a9977914fa',
  password: '02t67ElRUMZI',
  version: 'v1',
  version_date: '2017-05-26'
});


//-------------------------------------------------------------//


var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());
app.use(express.static('js'));
app.use('/css', express.static('css'));
app.use(express.static('www'));

var root = __dirname;
app.get('/', function(req, res) {
  fs.readFile(root + '/index.html', 'utf8', function(err, data) {
    if (!err) res.send(data);
    else return console.log("get isnt working");
  });
});



//POST//
app.post('/incomingMessage', function(req, res) {
  console.log("Post Request")
  console.log(req.body.message)

  //---------- WATSON SERVICE------------//
  conversation.message({
    workspace_id: 'ded77022-5066-4adc-bc5f-65b222e57289',
    input: { 'text': req.body.message },
    context: {'conversation_id': conversationID },
    //intents: [{'.intents': intent}]
  }, function(err, response) {
    if (err)
      console.log('error:', err);
    else
      responseMessage = JSON.stringify(response.output.text[0], null, 2)
      conversationID = response.context.conversation_id
      //intent = response.intents[0].intent;
      //console.log(intent)
      //console.log(conversationID)
      console.log(JSON.stringify(response, null, 2));
    res.send(responseMessage)
  });
  
  // MongoClient.connect(mongoURL, function(err, db) {
  // assert.equal(null, err);
  // console.log("Connected correctly to server.");
  // db.collection('MaxBack').find().toArray(function(err, result){
  //   console.log(result);
  // });
  
  // db.close();
  // });

});




var server = app.listen(process.env.PORT || '8080', '0.0.0.0', function() {
  if (process.env.PORT) {
    console.log("https://maxback-chatbot-bbrando0211.c9users.io/");
  }
  else {
    console.log('App listening at http://%s:%s', server.address().address, server.address().port);
  }
});
