module.exports = function(logger){

  this

    .use(require('../middleware/domain')(this, this.logger))

    .get('/',                 require('../middleware/ok'))
    .get('/crash',            require('../middleware/crash'))
    .get('/crash/sometimes',  require('../middleware/crashSometimes'))

    .use(require('../middleware/errorHandler'))

  ;

};
