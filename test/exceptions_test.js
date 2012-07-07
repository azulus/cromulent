/**
 * @fileoverview Unit tests for the exception handling system.
 */

var exceptions = require('../lib/exceptions')
var path = require('path')
var testCase = require('nodeunit').testCase
var util = require('util')

var ErrorResponse = exceptions.ErrorResponse
var TemplateManager = require('../lib/templates').TemplateManager


// TODO(david): Move the generic request exceptions to a common location in the library.

function BadRequest(message) {
  BadRequest.super_.call(this, message)
}
util.inherits(BadRequest, Error)
BadRequest.prototype.name = 'BadRequest'

function NotFound() {
  NotFound.super_.call(this)
}
util.inherits(NotFound, Error)
NotFound.prototype.name = 'NotFound'

function NotFound2() {}
util.inherits(NotFound2, NotFound)
NotFound2.prototype.name = 'NotFound2'


// Register a couple exceptions.
exceptions.registerHttpStatus(BadRequest, 400)

exceptions.registerCustomHandler(NotFound, function (err) {
  return new ErrorResponse(404, err.message)
})

module.exports = testCase({
  setUp: function (done) {
    // Compile the error templates for testing.
    var templates = new TemplateManager()
    templates.dirs.push(path.join(__dirname, '../lib/client'))
    templates.compile().then(function () {
      done()
    }).end()
  },

  testErrors: function (test) {
    test.equal(exceptions.handle(new NotFound()),
        '<h1>404</h1><p>The requested URL was not found</p>')
    test.equal(exceptions.handle(new BadRequest('error')),
        '<h1>400</h1><p>What\'d you do??</p>')
    test.equal(exceptions.handle(new Error('random error')),
        '<h1>500</h1><p>Oops! Something went wrong on our end.</p><p>random error</p>')
    test.equal(exceptions.handle(new NotFound2()),
        '<h1>404</h1><p>The requested URL was not found</p>')
    test.done()
  }
})
