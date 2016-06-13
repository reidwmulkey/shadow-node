# shadow-node

Shadow-node is a plugin to display a shadow site for a user  based on their IP. The use case I developed this for was for an emergency shutdown feature, blocking the user from the site for a certain amount of time. I first got the idea from [this site](http://www.safehaventc.org/). It uses client side code to perform the emergency shutdown. That still causes the page to flash, and on a slow enough network, you can still see a lot of the site content. So instead, this plugin will record access by IP and re-route blocked traffic to a shadow site, to make it look as if you are accessing the site correctly.  

Install
-----------------
```
	npm install shadow-node
```

Usage
-----------------
```
	var shadow = require('shadow-node');
	shadow.createClient(redisPort, redisHost);
	shadow.createShadow(shadowSite);
```

Where shadowSite is:
```
	var express = require('express');
	var router = express.Router();
	var app = express();

	router.get('/', function(req, res, next){
		res.send('This is my shadow home page');
	});

	router.get('/about', function(req, res, next){
		res.send('This is my shadow about page');
	});

	/*
	The rest of the routes needed for your shadow site
	*/

	/*
	This route is necessary. 
	If shadowSite doesn't catch the path the user inputs, then your application will continue onto your next route (AKA the route of your real app).
	*/
	router.all('*', function(req, res, next){
		res.status(404).send();
	});	

	app.use('/', router);
	module.exports = app;
```



Test
-----
The test depends on a local redisDB and will modify the redis keys "shadow-node-::ffff:127.0.0.1" and "shadow-node-1.1.1.1", an IP from a local machine and then an IP retrieve from behind an NGINX reverse proxy server. In order to run the tests, type:
```
	npm install --dev
	npm test
```

License
--------
(The MIT License)

Copyright (c) 2016 reidwmulkey

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.