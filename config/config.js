var path = require('path'),
  rootPath = path.normalize(__dirname + '/..'),
  env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    logFileName: 'log.json',
    app: {
      name: 'steam-jackpot-bot'
    },
    siteName: 'CSGO.in',
    siteDomain: 'http://localhost:3002',
    port: process.env.PORT || 3002,
    db: 'postgres://postgres:test123@localhost/csgoroll',
    steam: {
      currency: 1,
      gameId: 730,
      contextId: 2,
      returnUrl: 'http://localhost:3002/auth/steam/return',
      APIKey: 'E201120407FB3A62C13298A720E9828F',
      warehouseBot: {
        sharedSecret: 'MAVlSd7ftsXwOria3UdH6+7Ls6U=',
        identitySecret: "PuQ5TJdWEL+1WydKZpsuQdXzCQY=",
        accountName: 'fastspeed222',
        password: 'gktyybrdtnhf'
      },
      mainAccount: {
        sharedSecret: 'MAVlSd7ftsXwOria3UdH6+7Ls6U=',
        identitySecret: "PuQ5TJdWEL+1WydKZpsuQdXzCQY=",
        accountName: 'fastspeed222',
        password: 'gktyybrdtnhf'
      }
    }
  },
  test: {
    root: rootPath,
    logFileName: 'log.json',
    app: {
      name: 'steam-jackpot-bot'
    },
    siteName: 'CSGO.in',
    siteDomain: 'http://lottgame.com',
    port: process.env.PORT || 80,
    db: 'postgres://csgoin:vfd98H9K0df@localhost/csgoroll',
    steam: {
      currency: 1,
      gameId: 730,
      contextId: 2,
      returnUrl: 'http://lottgame.com/auth/steam/return',
      APIKey: 'C9EFB609826DE7E5AFCB0CAF5D92F320',
      jackpotBot: {
        sharedSecret: 'MAVlSd7ftsXwOria3UdH6+7Ls6U=',
        identitySecret: "PuQ5TJdWEL+1WydKZpsuQdXzCQY=",
        accountName: 'fastspeed222',
        password: 'gktyybrdtnhf'
      }
    }
  },

  production: {
    root: rootPath,
    logFileName: 'log.json',
    app: {
      name: 'steam-jackpot-bot'
    },
    siteName: 'CSGO.in',
    siteDomain: 'http://localhost:1616',
    port: process.env.PORT || 1616,
    db: 'mysql://define00_db:lnHpePBh@define00.mysql.ukraine.com.ua/define00_db',
    steam: {
      currency: 1,
      gameId: 730,
      contextId: 2,
      jackpotBot: {
        sharedSecret: 'MAVlSd7ftsXwOria3UdH6+7Ls6U=',
        identitySecret: "PuQ5TJdWEL+1WydKZpsuQdXzCQY=",
        accountName: 'fastspeed222',
        password: 'gktyybrdtnhf'
      }
    }
  },
};
var tlinl = 'https://steamcommunity.com/tradeoffer/new/?partner=213601918&token=133Qwkir';
module.exports = config[env];
