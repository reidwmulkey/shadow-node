// var util = require('./components/util');
// var mw = require('./components/middleware');
var redis = require('redis');
var q = require('q');
var express = require('express');

var client;
var shadowSite = express();
var middleware = express();
var util = {};

module.exports.createClient = function(port, host){
	client = redis.createClient(port, host);
}

module.exports.createShadow = function(incSite){
	shadowSite = incSite;

	middleware.all('*', isBannedMiddleware, shadowSite, function(req, res, next){
		next();
	});
}

util.banUser = function(req, duration, ip){
	var deferred = q.defer();
	if(!ip) ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'] : req.connection.remoteAddress;
	if(!duration) duration = 3600;
	var key = 'shadow-node-' + ip;
	if(!client)
		throw new ReferenceError('client is not defined. Have you run shadow.createClient()?', 'shadow-node.js', 25);
	else{
		client.get(key, function(err, val){
			if(err) deferred.reject(err);
			else if(val){
				deferred.resolve(val);
			}
			else{
				val = true;
				client.set(key, val, function(err){
					if(err) deferred.reject(err);
					else {
						client.expire(key, duration);
						deferred.resolve(val);
					}
				});
			}
		});
	}
	return deferred.promise;
}

util.isBanned = function(req){
	var deferred = q.defer();
	var ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'] : req.connection.remoteAddress;
	var key = 'shadow-node-' + ip;
	if(!client)
		throw new ReferenceError('client is not defined. Have you run shadow.createClient()?', 'shadow-node.js', 52);
	else {
		client.get(key, function(err, val){
			if(err) deferred.reject(err);
			else {
				if(!val) val = false;
				deferred.resolve(val);
			}
		});
	}
	return deferred.promise;
}

module.exports.util = util;

function isBannedMiddleware( req, res, next ) {
	util.isBanned(req)
	.then(function(isBanned){
		if(isBanned){
			if(!shadowSite)
				throw new ReferenceError('shadowSite is not defined. Have you run shadow.createShadow()?', 'shadow-node.js', 77);
			else
				next();
		}
		else {
			return next('route');
		}
	})
	.catch(function(err){
		return next(Error(err));
	});
}


module.exports.middleware = middleware;