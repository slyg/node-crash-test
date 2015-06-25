var cluster = require('cluster');

module.exports = function (req, res) {
  if (cluster.isMaster){
    console.log('[master] OK');
  } else {
    console.log('[worker %s] OK', cluster.worker.id);
  }
  res.send('OK');
};
