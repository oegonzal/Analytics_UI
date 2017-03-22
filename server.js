// set up

var express      = require('express');
var bodyParser   = require('body-parser');
var conf = require('./conf')
var app = express();

//configurations
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(conf.static_dir)); 
var port = process.env.port || conf.port;

//routes
require('./app/routes.js')(app);

// listen (start app with node server.js)
app.listen(port);
console.log("Listening on port: " + (port));
module.exports = app;
