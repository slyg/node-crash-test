/**
 * Listen for kill signals; shut down the server gracefully.
 */
var cluster = require('cluster');

module.exports = function () {

  var logger = this.logger;

  var handleExit = function (sig) {

    return function () {

      if (cluster.isMaster) {
        // no http server is running on the master if we use cluster
        return logger.info('[master][process listener] %s received, waiting for my workers to terminate', sig);
      }

      this.httpServer.close(function () {
        logger.info('[%s][process listener] closed', cluster.isMaster ? 'master' : 'worker '+cluster.worker.id );
        process.exit();
      });

    };

  };

  process
    .on('SIGTERM', handleExit('SIGTERM').bind(this))
    .on('SIGINT', handleExit('SIGINT').bind(this));
};
