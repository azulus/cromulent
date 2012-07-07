/**
 * @fileoverview Unit tests for ModuleLoader class.
 */

var path = require('path')
var testCase = require('nodeunit').testCase

var ModuleLoader = require('../lib/modules').ModuleLoader
var Registry = require('composers').Registry
var Scope = require('composers').Scope

var registry
var loader

module.exports = testCase({
  setUp: function (done) {
    registry = new Registry()
  	loader = new ModuleLoader(registry)
    loader.dirs.push(path.join(__dirname, 'modules'))

    loader.load().then(function () {
      done()
    }).end()
  },

  testNames: function (test) {
    var firstNames = ['Adam','Bob','Chris','David','Eric']
    var lastNames = ['Alexander','Barry','Cole','Diaz','Elwes']
    var scope = new Scope(registry)
    scope.enter()

    return scope.createGraph('full_name')
        .give('first_names', firstNames)
        .give('last_names', lastNames)
        .start()
        .then(function (fullName) {
          var nameParts = fullName.split(' ')
          test.equal(firstNames.indexOf(nameParts[0]) !== -1, true)
          test.equal(lastNames.indexOf(nameParts[1]) !== -1, true)
          test.done()
        })
        .end()
  }
})
