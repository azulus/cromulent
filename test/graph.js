var path = require('path')
var Graph = require('../lib/graph')

var graph = new Graph()
graph.dirs.push(path.join(__dirname, 'modules'))

graph
.load()
.then(function () {
  console.log("done", arguments)
})
.fail(function (e) {
  console.error(e)
})