var babelify = require('babelify')
var istanbul = require('browserify-babel-istanbul')

module.exports = function(config) {
  config.set({
    browsers: ['PhantomJS'],
    browserify: {debug: true, transform: [babelify]},
    frameworks: ['browserify', 'chai', 'fixture', 'mocha'],
    files: [
      'test/*.js',
      'test/fixtures/*.html',
    ],
    preprocessors: {
      'test/*.js': ['browserify'],
      'test/fixtures/*.html': ['html2js']
    },
    reporters: ['progress', 'saucelabs'],
    sauceLabs: {testName: 'DOM Seek test'},

    customLaunchers: {
      'SL_Chrome': {
        base: 'SauceLabs',
        browserName: 'chrome'
      },
      'SL_Firefox': {
        base: 'SauceLabs',
        browserName: 'firefox'
      },
      "SL_Safari": {
        base: "SauceLabs",
        browserName: "Safari",
        platform: "OS X 10.10",
        version: "8"
      },
      'SL_IE_9': {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        version: '9'
      },
      'SL_IE_10': {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        version: '10'
      },
      'SL_IE_11': {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        version: '11'
      }
    }
  })

  try {
    var sauceCredentials = require('./sauce.json')
    process.env.SAUCE_USERNAME = sauceCredentials.username
    process.env.SAUCE_ACCESS_KEY = sauceCredentials.accessKey
  } catch (e) {
    console.log('Note: run `git-crypt unlock` to use Sauce Labs credentials.')
  }

  if (process.env.COVERAGE) config.set({
    browserify: {debug: true, transform: [istanbul, babelify]},
    reporters: ['progress', 'saucelabs', 'coverage', 'coveralls']
  })

  if (process.env.TRAVIS) config.set({
    browsers: [process.env.BROWSER],
    coverageReporter: {type: 'lcov'}
  })
}
