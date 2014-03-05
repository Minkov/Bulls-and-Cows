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
    db: 'mongodb://localhost/bulls-and-cows-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'bulls-and-cows'
    },
    port: 3000,
    db: 'mongodb://localhost/bulls-and-cows-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'bulls-and-cows'
    },
    port: 3000,
    db: 'mongodb://localhost/bulls-and-cows-production'
  }
};

module.exports = config[env];
