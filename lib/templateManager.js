var soynode = require('soynode')
var v = require('valentine')
var q = require('q')

function TemplateManager() {
  this.dirs = []
}

TemplateManager.prototype.compile = function (callback) {
  if (this.dirs && this.dirs.length) {
      var d = q.defer()

      v.parallel(
        this.dirs.map(function (dir) {
          return function (cb) {
            soynode.compileTemplates(dir, cb)
          }
        }),
        function (err) {
          if (err) return d.reject(err)
          d.resolve(true)
        }      
      )

      return d.promise
  } else {
    return true
    return callback(null)
  }
}

TemplateManager.prototype.render = function (name, data) {
  var d = q.defer()
  d.resolve(soynode.render(name, data))
  return d.promise
}

module.exports = TemplateManager