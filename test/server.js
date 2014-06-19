
/**
 * Module dependencies.
 */

var exec = require('child_process').exec;
var express = require('express');
var path = require('path');
var fs = require('fs');

/**
 * Port.
 */

var port = 4203;

/**
 * App.
 */

var app = express()
  .use(express.static(path.join(__dirname, '/..')))
  .get('*', function(req, res, next){
    res.sendfile(__dirname + '/index.html');
  })
  .listen(port, function(){
    fs.writeFileSync(__dirname + '/pid.txt', process.pid, 'utf-8');
    console.log('Started testing server on port ' + port + '...');
  });
