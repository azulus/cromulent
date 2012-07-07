var composers = require('composers')
var q = require('q')
var fs = require('fs')
var path = require('path')

function ModuleLoader() {
  this.registry = new composers.Registry()
  this.dirs = []
  this.files = []
}


ModuleLoader.prototype._loadFile = function (file) {
  var stat = fs.lstatSync(file)
  
  // not a dir, should just read it in and return
  if (!stat.isDirectory()) {
    require(file)(this)
    return true
  }

  // dir, call _loadFile on all children
  var self = this
  var d = q.defer()
  var p = d.promise
  fs.readdir(file, d.makeNodeResolver())
  p = p.then(function (files) {
    if (!files.length) return true

    return q.allResolved(files.map(function (newFile) {
      return self._loadFile(path.join(file, newFile))
    }))
  })
  return p
}

ModuleLoader.prototype.load = function () {
  if (!this.dirs.length) return q.resolve(true)

  return q.allResolved(this.dirs.map(function (dir) {
    return this._loadFile(dir)
  }.bind(this)))
}

module.exports = {
  ModuleLoader: ModuleLoader
}