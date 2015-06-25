var express     = require('express'),
    _           = require('lodash'),
    loggerInit  = require('./initializers/logger'),
    server      = require('./initializers/server'),
    listeners   = require('./initializers/listeners'),
    middleware  = require('./initializers/middleware'),
    logger      = console;

var app = express();

var initializers = [
  loggerInit,
  middleware,
  server,
  listeners
];

// initializers.forEach(initializers, function(initializer){ initializer.call(app); });

_.each(initializers, function(initializer){ initializer.call(app); });
