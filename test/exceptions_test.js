var exceptions = require('../lib/exceptions')
var path = require('path')
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


function runTests() {
  // TODO(david): Turn these into asserts.
  console.log(exceptions.handle(new NotFound()))
  console.log(exceptions.handle(new BadRequest('error')))
  console.log(exceptions.handle(new Error('random error')))
  console.log(exceptions.handle(new NotFound2()))
}


// Compile the error templates for testing.
var templates = new TemplateManager()
templates.dirs.push(path.join(__dirname, '../lib/client'))
templates.compile().then(runTests).end()
