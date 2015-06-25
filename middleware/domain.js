var
  domain = require('domain'),
  util = require('util'),
  cluster = require('cluster');

/*
 * Constants
 */

var KILL_SERVER_TIMEOUT = 5000; //ms

/**
 * Encloses each request in a domain, so that unhandled errors can
 * be dealt with correctly. In the case of an unhandled error, we close
 * all requests to the server, then disconnect the cluster (if there is one).
 *
 * @param app
 * @returns {domains}
 */
module.exports = function (app, logger) {

  return function domains(req, res, next) {

    var d = domain.create();

    d.on('error', function (err) {

      try {

        var workerName = (cluster.isMaster) ? 'master' : util.format('worker %s', cluster.worker.id);

        // Make sure we close down within KILL_SERVER_TIMEOUT seconds
        var killtimer = setTimeout(function () {
          logger.error(util.format('[%s][domain] I\'m exiting %sms after uncaught error happened', workerName, KILL_SERVER_TIMEOUT));
          if (cluster.isMaster){
            process.exit(1);
          } else {
            cluster.worker.kill();
          }
        }, KILL_SERVER_TIMEOUT);

        // But don't keep the process opened just for that!
        killtimer.unref();

        // Log error
        logger.error(util.format('[%s][domain] I stop listening to incoming requests, will kill myself within %sms', workerName, KILL_SERVER_TIMEOUT)/*, err*/);

        // stop taking new requests.
        app.httpServer.close(function () {
          logger.error(util.format('[%s][domain] I stopped listening to incoming requests', workerName));
        });

      } catch (err2) {
        logger.error(util.format('[%s][domain] Error closing process', workerName), err2.stack);
      }

      // Invoke the default error handler
      next(err);

    });

    d.run(next);

  };
};
