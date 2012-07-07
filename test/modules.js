var assert = require('assert')
var path = require('path')

var ModuleLoader = require('../lib/modules').ModuleLoader
var Registry = require('composers').Registry
var Scope = require('composers').Scope

var registry = new Registry()
var loader = new ModuleLoader(registry)
loader.dirs.push(path.join(__dirname, 'modules'))

loader
.load().then(onLoad)
.end()

function onLoad() {
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
    assert.equal(firstNames.indexOf(nameParts[0]) !== -1, true)
    assert.equal(lastNames.indexOf(nameParts[1]) !== -1, true)
    console.log("Module loaded successfully")
  })
}