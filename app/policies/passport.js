"use strict";

const passport = require('passport');
const db = require('../models');
const config = require('../../config/config')

var SteamStrategy = require('passport-steam').Strategy;



passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  db.User.one(user.id)
    .then(function(res) {
      user.userData = res;
      done(null, user);
    })
    .catch(function (err) {
      done(err);
    });
});

passport.use(new SteamStrategy({
    returnURL: config.steam.returnUrl,
    realm: config.siteDomain,
    apiKey: config.steam.APIKey
  },
  function(identifier, profile, done) {
    process.nextTick(function () {
      let steamData = profile;
      let userData = null;

      db.User.add(steamData)
        .then(function (res) {
          profile.chatUserId = res.chatUserData.steamId;
          if (res.inserted) {
            profile.userData = res.userData;
            profile.identifier = identifier;
            done(null, profile);
          } else {
            return db.User.edit(steamData.id, {
              name: steamData.displayName,
              avatar: steamData._json.avatarfull,
            });
          }
        })
        .then(function (res) {
          profile.userData = res;
          profile.identifier = identifier;
          done(null, profile);
        })
        .catch(function (err) {
          done(err);
        });
    });
  }
));

passport.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated() && !req.user.userData.ban)
    return next();
  res.redirect('/');
};
/**
 * Middleware for API authorization checking
 */
passport.isApiAuthenticated  = function(req, res, next) {
  if (req.session.isAdmin || (req.isAuthenticated() && !req.user.userData.ban))
    return next();
  res.sendStatus(401);
};

passport.isAdmin = passport.restrictResource = function(req, res, next) {
  if (req.session.isAdmin){
      return next();
    }
  res.sendStatus(401);
};

passport.isAdminRender = function(req, res, next) {
  if (req.session.isAdmin) {
    return next();
  } else {
    res.render('../views/adminLogin', {
      title: 'Admin login',
      err: ''
    });
  }

};

module.exports = passport;
