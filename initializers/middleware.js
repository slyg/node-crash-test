module.exports = function(logger){

  this

    .use(require('../middleware/domain')(this, this.logger))

    .get('/',       require('../middleware/ok'))
    .get('/crash',  require('../middleware/crash'))

    .use(require('../middleware/errorHandler'))

  ;

};
