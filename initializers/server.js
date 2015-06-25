var cluster = require('cluster'),
    http = require('http'),
    numCPUs = +require('os').cpus().length,
    WorkersPool = require('../helpers/WorkersPool');

const PORT = 4000;
const RESERVED_CPU = 1;

module.exports = function(){

  var logger = this.logger;

  if (cluster.isWorker) {
    this.httpServer = http.createServer(this).listen(PORT);
    return this;
  }

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


};
