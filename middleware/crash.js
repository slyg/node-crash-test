module.exports = function (req, res) {
  process.nextTick(function(){
    res.send(truc.machin); // woooo, async uncaught exception miam miam
  });
};
