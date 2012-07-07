/**
 * @fileoverview Unit tests for ModuleLoader class.
 */

var path = require('path')
var testCase = require('nodeunit').testCase
var ModuleLoader = require('../lib/modules').ModuleLoader

module.exports = testCase({
  testLoading: function (test) {
  	var loader = new ModuleLoader()
    loader.dirs.push(path.join(__dirname, 'modules'))

    loader.load().then(function () {
      test.done()
    }).end()
  }, 
})
