var express = require('express');
var http = require('http');
var shadowSite = require('./shadowSite');
var shadow = require('../');

shadow.createClient(6379, 'localhost');
shadow.createShadow(shadowSite);

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