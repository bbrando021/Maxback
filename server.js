var express = require('express')
var app = express();
var fs = require('fs');

//--------EXPRESS-FILEUPLOAD MODULE FOR UPLOADING FILES-------//
const fileUpload = require('express-fileupload');
app.use(fileUpload());
//---------------CSVTOJSON MODULE-----------------------------//
const csvFilePath = 'dbUpdate.csv'
const csv = require('csvtojson')

//----------------MONGO DB -----------------------------------//

var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var assert = require('assert');
var mongoURL = 'mongodb://localhost:27017/test';


//---------------- WATSON SERVICES INITIALIZATION ------------//

var watson = require('watson-developer-cloud');
var conversation = watson.conversation({
  username: '44bb53b2-5278-48cc-bd6c-01a9977914fa',
  password: '02t67ElRUMZI',
  version: 'v1',
  version_date: '2017-05-26'
});

//----------------SESSION DATA---------------------------------//


//----------------------- TWILIO -----------------------------//

// const twilioAccountSid = '';
// const twilioAuthToken = '';
// var twilioClient = require('twilio')(twilioAccountSid, twilioAuthToken);

//------------------------------------------------------------//

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());
app.use(express.static('js'));
app.use('/css', express.static('css'));
app.use(express.static('www'));
var root = __dirname;


//_______________________SERVER GET/POST CODE__________________________//
////////////////////////////////////////////////////////////////////////


//_______GET HOMEPAGE________//
app.get('/', function(req, res) {
  fs.readFile(root + '/index.html', 'utf8', function(err, data) {
    if (!err) {
      res.send(data);
    }
    else {
      return console.log("get isnt working");
    }
  });
});


//_____GET ADMIN PAGE____//
app.get('/Admin', function(req, res) {
  fs.readFile(root + '/Admin.html', 'utf8', function(err, data) {
    if (!err) {
      res.send(data);
    }
    else {
      return console.log("get isnt working");
    }
  });
});


//_____GET EXTRA PAGE______//
app.post('/upload', function(req, res) {
  if (!req.files) {
    console.log("Cant Upload New File")
    res.send();
    return;
  }
  if(req.files.sampleFile== undefined){
    console.log("Cant Upload New File")
    res.send();
    return;
    
  }
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file

  let sampleFile = req.files.sampleFile;
  var fileType = sampleFile.name.split(".")

  if (fileType[fileType.length - 1] == 'csv') {

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv('dbUpdate.csv', function(err) {
      if (err)
        console.log("Could not save file");
      else {
        //now read in CSV and parse through to create JSON object to be uploaded to DB
        parseCSV('dbUpdate.csv');
      }
    });
    res.send();
  }
});


//_______POST FOR TWILLIO_______//                               //WORK IN PROGRESS...NEED CREDENTIALS
app.post('/sms', (req, res) => {
  /*const twiml = new MessagingResponse();
  twiml.message('The Robots are coming! Head for the hills!');
  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
  updateUsage("accessedTwilio");*/
});


//_______POST TO END CONVERSATION_______//                      // Client wants to end the conversation. //CAN BE REMOVED
app.post('/endConversation', function(req, res) {
  //handle this on the client side!
  console.log("EndConversation")
  res.send();
});


//_______POST TO START CONVERSATION_______//                    //This will initiate connection with Watson, getting the greeting message and new conversation object
app.post('/startConversation', function(req, res) {
  console.log("StartConversation")
  var contextConversation = {};

  conversation.message({
    workspace_id: 'ded77022-5066-4adc-bc5f-65b222e57289',
    input: { 'text': 'hi' },
    context: contextConversation,
  }, function(err, response) {
    if (err)
      console.log('error:', err)
    else {
      contextConversation = response.context;
      var responseMessage = JSON.stringify(response.output.text[0], null, 2)
      var data = {
        message: responseMessage.substr(1).slice(0, -1),
        contextConversation: contextConversation
      };
      res.send(data);
    };
  });
});


//_______POST GET CHAT STATS_______//                    //Query the DB and return results
app.post('/chatStats', function(req, res) {
  console.log("Admin getting chat stats");
  MongoClient.connect(mongoURL, function(err, db) {
    if (err) {
      console.log("Cant open DB")
      return;
    }
    assert.equal(null, err);

    var objectID = '5a723712d2e484e4ac08f4da';
    var dbo = db.db('chatStats');
    var collection = dbo.collection('usage');

    collection.find({ _id: ObjectID(objectID) }).toArray(function(err, result) {
      if (err) {
        console.log("Cant open DB")
      }

      res.send(result[0]);
    });

    db.close();
  });
});


//_______POST SAVE UAT INFORMATION_______//                    //Query the DB and return results
app.post('/UAT', function(req, res) {
  console.log("Saving UAT submission");
  MongoClient.connect(mongoURL, function(err, db) {
    if (err) {
      console.log("Cant open DB")
      return;
    }
    assert.equal(null, err);

    var dbo = db.db('UAT');
    var collection = dbo.collection('feedback');
    var obj = {
      conversation_id: req.body.conversation,
      colorTheme: req.body.colorTheme,
      fontSize: req.body.fontSize,
      message: req.body.message
    }
    collection.insert(obj);

    db.close();
    res.send();
  });
});


//_______POST GET CONVERSATION STATS_______//                    //Query the DB and return results
app.post('/conversations', function(req, res) {
  console.log("Admin getting conversation stats");
  MongoClient.connect(mongoURL, function(err, db) {
    if (err) {
      console.log("Cant open DB")
      return;
    }
    assert.equal(null, err);

    var dbo = db.db('chatStats');
    var collection = dbo.collection('conversations');
    console.log(req.body.message)
    if (req.body.message == undefined) {
      collection.find().toArray(function(err, result) {
        if (err) {
          console.log("Cant open DB")
        }
        res.send(result);
      });
    }
    else {
      console.log(req.body.message);
      collection.find({ user_Message: { $regex: new RegExp(req.body.message, "i") } }).toArray(function(err, result) {
        if (err) {
          console.log("Cant open DB")
        }
        res.send(result);
      });
    }

    db.close();
  });
});


//_______POST GET QUOTED DEVICES STATS_______//                    //Query the DB and return results
app.post('/devicesQuoted', function(req, res) {
  console.log("Admin getting devices quoted stats");
  MongoClient.connect(mongoURL, function(err, db) {
    if (err) {
      console.log("Cant open DB")
      return;
    }
    assert.equal(null, err);

    var dbo = db.db('chatStats');
    var collection = dbo.collection('devicesQuoted');
    console.log((req.body.message.length))
    console.log(req.body.type)
    if (req.body.message == 0 && req.body.price == 'price') {
      collection.find().toArray(function(err, result) {
        if (err) {
          console.log("Cant open DB")
        }
        res.send(result);
      });
    }
    else if (req.body.type == 'price') {
      collection.find({ quote: { $lte: parseInt(req.body.message) } }).toArray(function(err, result) {
        if (err) {
          console.log("Cant open DB");
        }
        res.send(result);
      });
    }
    else {
      console.log(req.body.message);
      collection.find({ device: { $regex: new RegExp(req.body.message, "i") } }).toArray(function(err, result) {
        if (err) {
          console.log("Cant open DB");
        }
        res.send(result);
      });
    }

    db.close();
  });
});



//______POST FOR EACH MESSAGE______//                           //Get the message from the client, send to watson, get response back, and do soemthing with it.
app.post('/incomingMessage', function(req, res) {
  //Conversation Context comes back as a JSON object. Watson doesnt like it. Convert to object.
  tempContext = JSON.parse(req.body.contextConversation)

  //Watson Conversation Service Request
  conversation.message({
    workspace_id: 'ded77022-5066-4adc-bc5f-65b222e57289',
    input: { 'text': req.body.message },
    context: tempContext,
  }, function(err, response) {
    if (err)
      console.log('error:', err)
    else {
      //If its not the first use of the chatbot, increment total uses in DB
      if (req.body.firstUse == 0) {
        req.body.firstUse = 1;
        updateUsage("accessed");
      }

      //Get Chatbot Response and format it
      var responseMessage = JSON.stringify(response.output.text[0], null, 2);
      console.log("USER: " + req.body.message);
      console.log("MAX:  " + responseMessage);

      //chatbot has no response!!!
      if (responseMessage == undefined) {
        //updating DB. Watson has no response to users message. Error in watson. Add error to users message.
        updateUsage("noResponse");
        res.send({
          message: "I'm sorry, I do not understand. Can you try rephrasing that.",
          contextConversation: response.context,
          firstUse: req.body.firstUse
        });
        //aways update the conversation reporting
        updateConversation(responseMessage, "&ERROR&" + req.body.message, response.context.conversation_id);
        return;
      }

      responseMessage = responseMessage.substr(1).slice(0, -1);

      console.log("Conversation ID: " + response.context.conversation_id);

      //If we are ready to get a quote...Watson will send a flag '&FIN& to let server know to look up quote'
      if (responseMessage.includes('&FIN&')) {
        //format the quote response (remove FIN)
        responseMessage = responseMessage.slice(5, responseMessage.lengthmongo)
        //get the full name of device and format it (reponse text is an array of 2 responses)
        var fullDeviceName = JSON.stringify(response.output.text[1], null, 2)
        //remove quotes around string
        fullDeviceName = fullDeviceName.substr(1).slice(0, -1)
        //splitting the full name to full unique device name, and condition
        var full_names = fullDeviceName.split("%")
        console.log("DB Lookup Name: " + full_names[0])
        console.log("DB Lookup Condition: " + full_names[1] + "\n")

        //try to start mongoDB to get quote
        MongoClient.connect(mongoURL, function(err, db) {
          if (err) {
            res.send({
              message: "I'm sorry, I could not find your quote, please try again, or use our website to also easily get a quote!",
              contextConversation: response.context,
              firstUse: req.body.firstUse
            });
            return;
          }
          assert.equal(null, err);

          //open DB, get collection for quoting, generate query, find the quote, update the conversation reporting.
          var quote, URL;
          var dbo = db.db('devices');
          var collection = dbo.collection('quotes');
          var query = { full_name: full_names[0] }
          console.log("QUOTE")
          findQuote(collection, query, full_names, res, dbo, response.context, req.body.firstUse, responseMessage);
          updateConversation(responseMessage, req.body.message, response.context.conversation_id);
        });
      }

      //If there is no quote to be given, and its just conversation, format the response and send it. 
      else {
        var data = {
          contextConversation: response.context,
          firstUse: req.body.firstUse,
          message: responseMessage
        };
        res.send(data)
        console.log();

        //document all conversation
        updateConversation(responseMessage, req.body.message, response.context.conversation_id);
      }
    }
  });
});


////////////////////////////////////////////////////////////
//____________________DATABASE USEAGE_____________________//
////////////////////////////////////////////////////////////

//LOADS IN THE CSV, MAKES A JSON OBJECT, UPDATES FULL DB
function parseCSV(fileName) {
  var updateObj;
  console.log("Reading in CSV file")
  csv()
    .fromFile(csvFilePath)
    .on('json', (jsonObj) => {})
    .on("end_parsed", function(jsonArrayObj) { //when parse finished, result will be emitted here.
      updateObj = jsonArrayObj;
    })
    .on('done', (error) => {
      console.log("CSV converted to JSON")
      //console.log((updateObj));
      updateDB(updateObj);
    })
}

//After the CSV has been converted to JSON, update the DB.
function updateDB(jsonObj) {
  MongoClient.connect(mongoURL, function(err, db) {
    if (err) {
      console.log("Cant open DB");
      return;
    }

    //load in the PROD DB and STG DB
    var dbo = db.db('devices');
    var collection = dbo.collection('quotes');
    var tempCollection = dbo.collection('STG_quotes');

    tempCollection.remove({}, function(err, res) {
      if (err) {
        console.log("Can not refresh STG DB");
      }
      console.log("Refreshing STG DB")


      //copy current PROD db to a temp STG db.
      collection.find().forEach(function(x) {
        tempCollection.insert(x, function(err, res) {
          if (err) {
            console.log("Insert Error");
            return;
          }
        });
      }, function(err) {});

      collection.remove({}, function(err, res) {
        if (err) {
          console.log("Can not refresh DB");
        }
        console.log("Refreshing PROD DB")

        collection.insert(jsonObj, function(err, res) {
          if (err) {
            console.log("Error overwriting DB. Need to revert");
            backupFromSTG();
          }
          console.log("Updated PROD DB")

          db.close;
        });
      });
    });
  });
}

function backupFromSTG(){
  console.log("Need backup Implemented");
}

var recursive = 0;
//FUNCTION TO FIND QUOTE, WILL CALL ITSELF TO REFORMAT QUERY, if can not find result
function findQuote(collection, query, full_names, res, db, contextConversation, firstUse, responseMessage) {
  var quote, removePadding = 0;
  while(removePadding ==0){
    var size = full_names[0].length;
    if(full_names[0][size-1] == " "){
      full_names[0] = full_names[0].substring(0, full_names[0].length - 1); 
    }
    else{
      removePadding =1;
      query = {full_name: full_names[0]};
    }
  }
  console.log(query);
  collection.find(query).toArray(function(err, result) {
    //SUCCESS
    console.log("Lookup: " + full_names[0])
    if (!err && result.length != 0) {
      console.log('FOUND: ' + JSON.stringify(result, null, 2));
      quote = result[0].condition;
      quote = quote[full_names[1]];
      URL = result[0].URL;
      console.log("Quote: " + quote);
      var URL = result[0].URL;
    }
    else if (result.length == 0) {
      console.log("Could not find quote")
      if (recursive > 2) {
        var data = {
          contextConversation: contextConversation,
          firstUse: firstUse,
          message: "I'm sorry, I could not find your quote, please try again, or use our website to also easily get a quote!"
        };
        res.send(data);
        console.log();
        return;
      }
      //Slice the unique device name to shorten it, sometimes the device name is shorter than the actual information needed to quote.
      console.log("Recursive DB Lookup");
      var place = full_names[0].lastIndexOf(" ");
      full_names[0] = full_names[0].slice(0, ++place);
      var queryTwo = { full_name: full_names[0] }
      recursive++;
      findQuote(collection, queryTwo, full_names, res, db, contextConversation, firstUse, responseMessage);
      return;
    }
    
    if(quote == "0"){
      responseMessage = "Unfortunately, it looks like we are not buying your device at this time.";
    }
    else{
    responseMessage = responseMessage + " $" + quote + "\n~https://www.maxback.com/sell/" + URL;
    }
    updateUsage("quote");

    var data = {
      contextConversation: contextConversation,
      firstUse: firstUse,
      message: responseMessage
    };
    res.send(data);
    console.log();
    db.close();

    //if a quote was given, document it
    if (quote != undefined || quote != '') {
      updateQuotes(full_names, quote);
    }
  });
}


//__________MONGODB STATISTICS ZONE_____________//

//When a quote is given, update it in collection for reporting
function updateQuotes(device_name, quote) {
  MongoClient.connect(mongoURL, function(err, db) {
    if (err) {
      console.log("Cant open DB");
      return;
    }
    assert.equal(null, err);
    if (err) {
      console.log("Cant open DB");
      return;
    }
    var objectID = '5a723712d2e484e4ac08f4da';
    var dbo = db.db('chatStats');
    var collection = dbo.collection('devicesQuoted');

    var obj = { device: device_name[0], condition: device_name[1], quote: quote };
    collection.insert(obj);
    console.log("Mongo: Inserted Device Quote")
    console.log();

    db.close();

  });

}

//Each time the user types a message and the bot responds, record that for analyzation later for improvements.
function updateConversation(response, userMessage, conversation_id) {
  MongoClient.connect(mongoURL, function(err, db) {
    if (err) {
      console.log("Cant open DB");
      return;
    }
    assert.equal(null, err);

    var dbo = db.db('chatStats');
    var collection = dbo.collection('conversations');
    collection.find({ conversation_id: conversation_id }).toArray(function(err, result) {

      if (err) {
        console.log("Cant open DB")
      }
      else if (result.length == 0) {
        console.log("Mongo: Creating Conversation Record");
        var dateTemp = new Date()
        console.log(dateTemp.getYear())
        console.log(dateTemp.getMinutes())
        var dateString = dateTemp.getDay() + "/" + dateTemp.getMonth() + "/" + dateTemp.getYear() + " @ " + dateTemp.getHours() + ":" + dateTemp.getMinutes();
        var obj = {
          conversation_id: conversation_id,
          date_accessed: dateString,
          user_Message: [userMessage],
          bot_Response: [response]
        };
        collection.insert(obj);
      }
      else {
        console.log("Mongo: Updating Conversation Record");
        collection.update({ conversation_id: conversation_id }, { $push: { user_Message: userMessage, bot_Response: response } });
      }
      console.log();
      db.close();
    });

  });

}

//Update usage statistics, when a user accesses chatbot first time, then they use twillio, when a quote is given, when the bot does not know what to say.
function updateUsage(usageType) {
  //try to start mongoDB
  MongoClient.connect(mongoURL, function(err, db) {
    if (err) {
      console.log("Cant open DB")
      return;
    }
    assert.equal(null, err);
    if (err) {
      console.log("Cant open DB")
      return;
    }
    var objectID = '5a723712d2e484e4ac08f4da';
    var dbo = db.db('chatStats');
    var collection = dbo.collection('usage');

    //INCREMENT THE NUM OF TIMES THE CHATBOT HAS BEEN ACCESSED, QUOTED, AND GOTTEN NO RESPONSE FROM WATSON
    if (usageType == "accessed") {
      console.log("Mongo: First Time Access Recorded")
      collection.update({ _id: ObjectID(objectID) }, { $inc: { "times_accessed": 1 } });
    }
    if (usageType == "accessedTwilio") {
      console.log("Mongo: Accesed Twilio Recorded")
      collection.update({ _id: ObjectID(objectID) }, { $inc: { "times_accessed_twilio": 1 } });
    }
    if (usageType == "quote") {
      console.log("Mongo: Quote Recorded")
      collection.update({ _id: ObjectID(objectID) }, { $inc: { "num_of_quotes": 1 } });
    }
    if (usageType == "noResponse") {
      console.log("Mongo: No Response Recorded")
      collection.update({ _id: ObjectID(objectID) }, { $inc: { "uncaught_errors_in_watson": 1 } });
    }
    console.log();
    db.close();
  });

}


//_________SERVER_________//

var server = app.listen(process.env.PORT || '8080', '0.0.0.0', function() {
  if (process.env.PORT) {
    console.log("https://maxback-chatbot-cloned-new-bbrando0211.c9users.io/");
  }
  else {
    console.log('App listening at http://%s:%s', server.address().address, server.address().port);
  }
});
