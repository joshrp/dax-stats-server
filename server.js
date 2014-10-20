var cluster = require('cluster'),
	config = require('config')

// When this server module is run, it create a worker process which will
// do all of the work (there will always be 2 processes (master and worker)).
// If the worker module dies due to an unexpected error, this module will
// create a new worker process. See: http://nodejs.org/api/cluster.html.

if (cluster.isMaster) {
  // create a worker process
  var worker = cluster.fork();
  console.log('new worker', worker.id)
  cluster.on('exit', function (worker) {
  	console.log('worker', worker.id, 'died')
    // create a new worker process
    worker = cluster.fork();
  	console.log('new workder', worker.id)
  });
} else {
  require('./src/index');
}