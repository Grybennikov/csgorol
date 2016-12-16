"use strict";

var Promise = require('bluebird');
var config = require('../../config/config');

module.exports.webSessionAction = Promise.coroutine(function* (sessionID, cookies, botId) {
  try {
    global.manager[botId].setCookies(cookies, (err) => {
      if(err) {
        console.log(err);
        process.exit(1);
        return;
      }
      console.log("Got API key: " + global.manager[botId].apiKey);
  });

    global.community[botId].setCookies(cookies);
    global.community[botId].startConfirmationChecker(1000, config.steam[botId].identitySecret);
  } catch (err) {
    console.log(err);
  }
});

