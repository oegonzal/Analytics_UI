var path = path = require('path'),
    pathname = path.join(__dirname, '../public/index.html');

var express = require('express');
var app = express();
module.exports = function(app) {

        // frontend routes =========================================================

        // route to handle all angular requests
        app.get('/', function(req, res) {
            res.sendFile(pathname); 
        });

        app.get('/crq', function(req, res) {
            res.sendFile(pathname); 
        });

        app.get('/basic/:id', function(req, res) {
            res.sendFile(pathname); 
        });

        app.get('/detailed/:id', function(req, res) {
            res.sendFile( pathname); 
        });

        app.get('/lookup', function(req, res) {
            res.sendFile(pathname); 
        });

        app.get('/about', function(req, res) {
            res.sendFile( pathname); 
        });

        app.get('/contact', function(req, res) {
            res.sendFile(pathname); 
        });

        console.log("Reached Routes.js");
        app.use('/mssql', require('./routes/mssql'));
        app.use('/cass', require('./routes/cassandra'));
        app.use('/zero', require('./routes/pageZero'));

        
    };