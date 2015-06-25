var backbone = require('backbone');


/*
 * Worker instance model
 */
var Worker = backbone.Model.extend({
  defaults: {
    isExited : false,
    isConnected : true
  },
  constructor: function(worker){
    backbone.Model.call(this, {
      id: worker.id
    });
  }
});

/*
 * Workers pool instance model
 */
module.exports = backbone.Collection.extend({

  model: Worker,

  initialize: function() {
    this.bind('change', this._onChange, this);
  },

  disconnect : function(worker){
    this.findWhere({id : worker.id}).set('isConnected', false);
  },

  exit : function(worker){
    this.findWhere({id : worker.id}).set('isExited', true);
  },

  _onChange : function(){

    // Clean useless worker
    var uselessWorker = this.findWhere({
      isExited : true,
      isConnected : false
    });

    if (uselessWorker) {
      this.remove(uselessWorker.get('id'));
    }

    // Fire event when pool is empty
    if (this.length < 1) {
      this.trigger('empty');
    }

  }


});
