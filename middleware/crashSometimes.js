var cluster = require('cluster');

module.exports = function (req, res) {

  process.nextTick(function(){

    var test = (Math.random()*100 > 5);

    if (test) {
      console.log('[worker %s] OK', cluster.worker.id);
      return res.send('OK');
    }

    console.log('[worker %s] Will crash !', cluster.worker.id);
    res.send(truc.machin);

  });

};
