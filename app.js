var express = require('express');
var esClient = require('./esConnection.js');
var path = require('path');
var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var PORT = process.env.PORT || 3000;
//set variable deployPath in web.config to match the virtual directory in IIS
//if app.js is run from command line (node app.js) deployPath is set to empty string.
var deployPath = process.env.deployPath || "";

var sendJsonResponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

app.get(deployPath + '/', function (req, res) {
   //search cluster for data
   esClient.search({  
      body: {
          "query": {
            "bool": {
              "filter": [
                {
                  "term": {
                    "status": "active"
                  }
                }
              ]
            }
          },
         "size": 1000
      }
   },function (error, response, status) {
      if (error){
         sendJsonResponse(res, 500, error);
      } else {
         res.render('es-query', {
           data: response
         });
         //sendJsonResponse(res, 200, response);
      }
   });
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, function() {
   //console.log('App listening on port ' + PORT);
});