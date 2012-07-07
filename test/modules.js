var path = require('path')
var ModuleLoader = require('../lib/modules').ModuleLoader

var loader = new ModuleLoader()
loader.dirs.push(path.join(__dirname, 'modules'))

loader
.load().then(function () {
  console.log("done", arguments)
})
.end()