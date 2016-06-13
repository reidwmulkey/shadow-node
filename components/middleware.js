var express = require('express');
var utils;

module.exports = function(util, shadowSite){
  var app = express();
  utils = util;

  app.all('*', isBannedMiddleware, shadowSite, function(req, res, next){
    next();
  });

  function isBannedMiddleware( req, res, next ) {
    utils.isBanned(req)
    .then(function(isBanned){
      if(isBanned){
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

  return app;
}