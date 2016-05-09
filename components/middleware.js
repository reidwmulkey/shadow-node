var express = require('express');
var utils;

module.exports = function(util, fakeRouter){
  var app = express();
  utils = util;

  app.all('*', isBannedMiddleware, fakeRouter, function(req, res, next){
    next();
  });

  function isBannedMiddleware( req, res, next ) {
    utils.isBanned(req)
    .then(function(isBanned){
      console.log("isBanned", isBanned);
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