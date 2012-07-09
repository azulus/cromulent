var q = require('q')
var fs = require('fs')
var path = require('path')


/**
 * Creates an instance of ModuleLoader which loads in modules
 * of composer registry nodes
 *
 * @constructor {ModuleLoader}
 * @params {Object} registry a composer registry instance
 */
function ModuleLoader(registry) {
  this.registry = registry
  this.dirs = []
  this.files = []
}

/**
 * Internal function which will return a promise which will
 * resolve when the path provided has been fully loaded by
 * ModuleLoader
 *
 * @param {String} file the name of the file/directory to load
 * @returns {Object} a promise which will resolve when the file
 *     or directory has finished loading
 */
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

/**
 * Loads all directories fed into this ModuleLoader and returns
 * a promise which will resolve when all directories are loaded
 *
 * @returns {Object} promise which will resolve when all dirs
 *     have been loaded
 */
ModuleLoader.prototype.load = function () {
  if (!this.dirs.length) return q.resolve(true)

  return q.allResolved(this.dirs.map(function (dir) {
    return this._loadFile(dir)
  }.bind(this)))
}

module.exports = {
  ModuleLoader: ModuleLoader
}