module.exports = function(port, host, fakeRouter){
  var util = require('./components/util')(port, host);
  var mw = require('./components/middleware')(util, fakeRouter);

  return {
    util: util,
    middleware: mw
  };
}