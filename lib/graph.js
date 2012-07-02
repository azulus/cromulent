var asyncBuilder = require('asyncBuilder')
var q = require('q')

function Graph() {
  this.dirs = []
}

Graph.prototype.load = function () {
  var d = q.defer()

  process.nextTick(function () {
    var dirs = this.dirs.slice(0)
    d.resolve("ok")
  }.bind(this))

  return d.promise
}

module.exports = Graph