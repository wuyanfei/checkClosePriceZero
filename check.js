var REDIS = null;
var dateFormat = require('./dateFormat');
var async = require('async');
process.on('message', function(task) {
	var redis = task.redis;
	REDIS = require('redis').createClient(redis.split(':')[1], redis.split(':')[0]);
	start(task.array);
});

var start = function(array) {
		async.forEach(array, function(item, cb) {
			// console.log(item);
			REDIS.lrange(item, 0, -1, function(e, r) {
				if(e)console.log(e);
				if(r && r.length > 0) {
					deal(item, r, cb);
				}else{
					cb();
				}
			});
		}, function() {
			process.send({'pid':process.pid,'msg':',股票：'+array.length+'个，处理结束。'});
			setTimeout(function() {
				process.exit(0);
			}, 5000);
		});
	}

var deal = function(key, list, cback) {
	var now_time = new Date().format('yyyyMMdd');
		async.forEach(list, function(item, cb) {
			var price = -1;
			price = item.split('|')[1];
			var time = item.split('|')[0];
			time = time.substring(0,8);
			//console.log(key,time+','+now_time);
			if(price == 0 && now_time == time) {
				console.log(key, item);
			}
			cb();
		}, function() {
			cback();
		});
	}