var async = require('async');
var program = require('commander');
var REDIS = null;
var THREADS = 8;
var getRedis = function(address) {
	console.log('启动'+THREADS+'个线程,在【'+address+'】中开始查找。。。')
		var redis = require('redis').createClient(address.split(':')[1], address.split(':')[0]);
		REDIS = address;
		redis.keys('MLINE.*', function(e, r) {
			if(e) {
				console.log(e);
			} else {
				var array = [];
				for(var i=0;i<r.length;i++){
					if(r[i].indexOf('HK') == -1){
						array.push(r[i]);
					}
				}
				console.log('总共要处理'+array.length+'支股票。');
				process_load_f(array);
			}
		});
	};

var COUNT = 0;
var process_load_deal = function(array) {
		var cp = require('child_process');
		var n = cp.fork(__dirname + '/check.js');
		n.on('message', function(m) {
			console.log('pid:'+m.pid+m.msg);
			COUNT = parseInt(COUNT)+1;
			if(COUNT == THREADS){
				console.log('处理结束。');
				setTimeout(function(){
					process.exit(0);
				},5000);
			}
		});
		n.send({
			'array': array,
			'redis': REDIS
		});
	};
var process_load_f = function(keys) {
		var length = keys.length;
		var threads = length < THREADS ? length : THREADS;
		var index = parseInt(length / threads);
		if(index * threads < length) {
			threads = parseFloat(threads) + 1;
		}
		THREADS = threads;
		for(var i = 0; i < threads; i++) {
			var count = (i == threads - 1) ? (length >= (index * (i + 1)) ? (index * (i + 1)) : length) : (index * (i + 1));
			var temp = keys.slice(index * i, count);
			process_load_deal(temp);
		}
	}

program.version('0.1').usage('[options] ').option('-r --redis <n>', 'redis地址', getRedis)

program.on('--help', function() {
	console.log('  查看分时中是否存在昨收价没有成功赋值的情况：');
	console.log('  Examples:');
	// console.log('');
	console.log('      $ node index.js -r 172.16.33.203:6390');
});

program.parse(process.argv);