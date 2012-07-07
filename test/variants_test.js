var path = require('path')
var q = require('q')
var testCase = require('nodeunit').testCase
var variants = require('variants')

var Server = require('../lib/server').Server
var Scope = require('composers').Scope


var server = null

module.exports = testCase({
  setUp: function (done) {
    server = new Server()
    server.loadVariants(path.join(__dirname, 'variants/testdata.json'))
        .then(function () {
          done()
        }).end()
  },

  testPasses: function (test) {
    var scope = new Scope(server.registry)
    scope.enter()

    return scope.createGraph('variant.always_passes')
        .give('variants-request-context')
        .start()
        .then(function (alwaysPasses) {
          test.equal(alwaysPasses, true)
          test.done()
        })
  },

  testFails: function (test) {
    var scope = new Scope(server.registry)
    scope.enter()

    return scope.createGraph('variant.always_fails')
        .give('variants-request-context')
        .start()
        .then(function (alwaysFails) {
          test.equal(alwaysFails, false)
          test.done()
        })
  }
})
