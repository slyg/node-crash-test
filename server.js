var app = require('express')();
var cluster = require('cluster');
var http = require('http');
var numCPUs = +require('os').cpus().length;
var WorkersPool = require('./helpers/WorkersPool');
var logger = console;

const PORT = 4000;
const RESERVED_CPU = 1;

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
    logger.info('[master][pool] No more active worker, I\'m exiting process (%s)', process.pid);
    process.exit();
  });

  cluster

    .on('fork', function (worker) {
      logger.info('[master] I spawned [worker %s]', worker.id);
      workersPool.add(worker);
    })

    .on('disconnect', function (worker) {

      logger.info('[master] I see that [worker %s] has disconnected', worker.id);
      workersPool.disconnect(worker);

      if (worker.suicide) {
        // disconnect has been explicitly called in the code
        logger.info('[master] I will respawn a new worker to replace [worker %s]', worker.id);
        cluster.fork();
      }

    })

    .on('exit', function(worker, code, signal) {
      logger.info('[master] I see that [worker %s] has exited', worker.id);
      workersPool.exit(worker);
    });

  // fork clusters
  for (var i = 0; i < numCPUs-RESERVED_CPU; i++) {
    cluster.fork();
  }

} else {
  app.httpServer = http.createServer(app).listen(PORT);
}
