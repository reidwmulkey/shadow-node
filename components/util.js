var redis = require('redis');
var q = require('q');

module.exports = function(port, host){
  var client = redis.createClient(port, host);
  var module = {};

  module.banUser = function(duration, ip){
    var deferred = q.defer();
    if(!ip) ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'] : req.connection.remoteAddress;
    if(!duration) duration = 3600;
    var key = 'shadow-node-' + ip;
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
    return deferred.promise;
  }

  module.isBanned = function(req){
    var deferred = q.defer();
    var ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'] : req.connection.remoteAddress;
    var key = 'shadow-node-' + ip;
    client.get(key, function(err, val){
      if(err) deferred.reject(err);
      else {
        if(!val) val = false;
        deferred.resolve(val);
      }
    });
    return deferred.promise;
  }

  return module;
}