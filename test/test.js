var redis = require('redis');
var request = require('supertest-as-promised');
var assert = require('assert');
var app1, app2;
var ip1 = "::ffff:127.0.0.1", ip2 = "1.1.1.1";
var shadow = require('../');
shadow.createClient(6379, 'localhost');
shadow.createShadow(require('./shadowSite'));

describe('shadow-node', function(){
	before(function(done){
		var client = redis.createClient(6379, 'localhost');
		client.del("shadow-node-" + ip1, "shadow-node-" + ip2, function(err){
			if(err) done(err);
			else{
				app1 = require('./express')(3000);
				app2 = require('./express')(3001);
				done();
			}
		});
	});

	it('IP1 should not be banned', function(done){
		request(app1)
		.get("/")
		.expect(200)
		.then(function(res) {
			assert.equal("This is real", res.text);
			done();
		})
		.catch(done);
	});

	it('IP2 should not be banned', function(done){
		request(app1)
		.get("/")
		.expect(200)
		.set('x-forwarded-for', "1.1.1.1")
		.then(function(res) {
			assert.equal("This is real", res.text);
			done();
		})
		.catch(done);
	});

	it('should ban IP1 and return shadow site', function(done){
		shadow.util.banUser(null, null, ip1)
		.then(function(){
			request(app1)
			.get("/")
			.expect(200)
			.then(function(res) {
				assert.equal("This is fake", res.text);
				done();
			})
			.catch(done);	
		})
		.catch(done);
	});

	it('should still be banned from app2', function(done){
		request(app2)
		.get("/")
		.expect(200)
		.then(function(res) {
			assert.equal("This is fake", res.text);
			done();
		})
		.catch(done);	
	});

	it('should access the regular site after the ban has expired', function(done){
		shadow.util.banUser(null, 1, ip2)
		.then(function(){
			setTimeout(function(){
				request(app1)
				.get("/")
				.expect(200)
				.set('x-forwarded-for', "1.1.1.1")
				.then(function(res) {
					assert.equal("This is real", res.text);
					done();
				})
				.catch(done);	
			}, 1100);
		})
		.catch(done);
	});

	it('should allow me to use a new require("shadow") to ban the user', function(done){
		require('../').util.banUser(null, 1, ip2)
		.then(function(){
			request(app1)
			.get("/")
			.expect(200)
			.set('x-forwarded-for', "1.1.1.1")
			.then(function(res) {
				assert.equal("This is fake", res.text);
				done();
			})
			.catch(done);	
		})
		.catch(done);
	});
});