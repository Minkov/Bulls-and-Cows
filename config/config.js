var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'bulls-and-cows'
    },
    port: 3000,
    // db: 'mongodb://localhost/bulls-and-cows-development'
      db: 'mongodb://AdminMaster:123456q@ds027738.mongolab.com:27738/battle-game'
  },

  test: {
    root: rootPath,
    app: {
      name: 'bulls-and-cows'
    },
    port: 3000,
    // db: 'mongodb://localhost/bulls-and-cows-test'
      db: 'mongodb://AdminMaster:123456q@ds027738.mongolab.com:27738/battle-game'
  },

  production: {
    root: rootPath,
    app: {
      name: 'bulls-and-cows'
    },
    port: 3000,
    // db: 'mongodb://localhost/bulls-and-cows-production'
      db: 'mongodb://AdminMaster:123456q@ds027738.mongolab.com:27738/battle-game'
  }
};

module.exports = config[env];
