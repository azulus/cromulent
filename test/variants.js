var assert = require('assert')
var path = require('path')
var q = require('q')
var variants = require('variants')

var Server = require('../lib/server').Server
var Scope = require('composers').Scope

var server = new Server()

server.loadVariants(path.join(__dirname, 'variants/testdata.json'))
.then(onLoad)
.end()

function onLoad() {
  return q.allResolved([
    testPasses(),
    testFails()
  ])
}

function testPasses() {
  var scope = new Scope(server.registry)
  scope.enter()

  return scope.createGraph('variant.always_passes')
  .give('variants-request-context')
  .start()
  .then(function (alwaysPasses) {
    assert.equal(alwaysPasses, true)
    console.log("always_passes variant succeeded")
  })
}

function testFails() {
  var scope = new Scope(server.registry)
  scope.enter()

  return scope.createGraph('variant.always_fails')
  .give('variants-request-context')
  .start()
  .then(function (alwaysFails) {
    assert.equal(alwaysFails, false)
    console.log("always_fails variant succeeded")
  })
}