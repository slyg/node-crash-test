var app = require('express')();
var cluster = require('cluster');
var http = require('http');
var numCPUs = +require('os').cpus().length;
var WorkersPool = require('./helpers/WorkersPool');

var logger = {
  info : console.info,
  warn : console.warn,
  error : console.error
};

app
  .use(require('./middleware/domain')(app, logger))
  .get('/', require('./middleware/ok'))
  .get('/crash', require('./middleware/crash'))
  .use(require('./middleware/errorHandler'))
;

if (cluster.isMaster) {

  // handle workers pool
  var workersPool = new WorkersPool();

  workersPool.on('empty', function(){
    console.log('[master][pool] No more active worker, I\'m exiting process (%s)', process.pid);
    process.exit();
  });

  cluster

    .on('fork', function (worker) {
      console.log('[master] I spawned [worker %s]', worker.id);
      workersPool.add(worker);
    })

    .on('disconnect', function (worker) {

      console.log('[master] I see that [worker %s] has disconnected', worker.id);
      workersPool.disconnect(worker);

      if (worker.suicide) {
        // disconnect has been explicitly called in the code
        console.log('[master] I will respawn a new worker to replace [worker %s]', worker.id);
        cluster.fork();
      }

    })

    .on('exit', function(worker, code, signal) {
      console.log('[master] I see that [worker %s] has exited', worker.id);
      workersPool.exit(worker);
    });

  // fork clusters
  for (var i = 0; i < numCPUs-1; i++) {
    cluster.fork();
  }

} else {
  app.httpServer = http.createServer(app).listen(4000);
}
