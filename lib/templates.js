var soynode = require('soynode')
var q = require('q')

function TemplateManager() {
  this.dirs = []
}

TemplateManager.prototype.compile = function () {
  if (!this.dirs || !this.dirs.length) return q.resolve(true)

  return q.allResolved(this.dirs.map(function (dir) {
    var d = q.defer()
    soynode.compileTemplates(dir, d.makeNodeResolver())
    return d.promise
  }))
}

TemplateManager.prototype.render = function (name, data) {
  return q.resolve(soynode.render(name, data))
}

module.exports = {
  TemplateManager: TemplateManager
}