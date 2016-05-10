var express = require('express');
var http = require('http');
var shadowRouter = require('./shadowRouter');
var shadow = require('../')(6379, 'localhost', shadowRouter);

module.exports = function(port){
	var app = express();
	
	app.use(shadow.middleware);

	app.get('/', function(req, res, next) {
		res.send('This is real');
	});

	app.set('port', port);

	var server = http.createServer(app);

	server.listen(port);
	console.log('server listening on port ' + port + '.');

	return server;
}