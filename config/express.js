const express = require('express');
const glob = require('glob');

const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const moment = require('moment');
const sha256 = require('sha256');

var db = require('../app/models');


var  passport = require('passport')
  , util = require('util')
  , session = require('express-session')
  , SteamStrategy = require('passport-steam').Strategy;



module.exports = function(app, config) {
  var env = process.env.NODE_ENV || 'development';
  app.locals.ENV = env;
  app.locals.ENV_DEVELOPMENT = env == 'development';

  app.set('views', config.root + '/app/views');
  app.set('view engine', 'ejs');

  app.use(session({
    secret: 'super secret qwe',
    name: 'steam-betting-site',
    resave: true,
    saveUninitialized: true}));

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.static(__dirname + '/../../public'));

  // app.use(favicon(config.root + '/public/img/favicon.ico'));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(cookieParser());
  app.use(compress());
  app.use(express.static(config.root + '/public'));
  app.use(methodOverride());

  var routers = glob.sync(config.root + '/app/routers/**/*.js');
  routers.forEach(function (router) {
    require(router)(app);
  });

  app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  if(app.get('env') === 'development'){
    app.use(function (err, req, res, next) {
      res.status(err.status || 500);
      res.send({error: {
        message: err.message,
        error: {},
        title: 'error'
      }});
    });
  }

  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
      res.send({error: {
        message: err.message,
        error: {},
        title: 'error'
      }});
  });

};
