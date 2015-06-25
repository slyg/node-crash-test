var cluster = require('cluster');

module.exports = function (err, req, res, next) {
  if (cluster.isMaster){
    console.log('[master][middleware] Something went wrong, responding with error page');
  } else {
    console.log('[worker %s][middleware] Something went wrong, responding with error page', cluster.worker.id);
  }
  res.send('KO :-(');
};
