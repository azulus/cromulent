var soynode = require('soynode')
var q = require('q')

/**
 * Constructs an instance of TemplateManager which will handle
 * loading and rendering of templates
 *
 * @constructor {TemplateManager}
 * @params {Object} registry a composers registry
 */
function TemplateManager(registry) {
  this.dirs = []
  this.registry = registry
}

/**
 * Compile all of the templates in the directories watched by this
 * TemplateManager instance
 *
 * @return {Object} a promise which will resolve once templates have
 *     been compiled
 */
TemplateManager.prototype.compile = function () {
  if (!this.dirs.length) return q.resolve(true)

  return q.allResolved(this.dirs.map(function (dir) {
    var d = q.defer()
    soynode.compileTemplates(dir, d.makeNodeResolver())
    return d.promise
  }))
}

/**
 * Render a given template and data and return as a resolved promise
 *
 * @param {string} name the name of the template to render
 * @param {Object} data the data to pass to the template renderer
 * @return {Object} returns a promise which will return a string once
 *     resolved with the rendered template content
 */
TemplateManager.prototype.render = function (name, data) {
  return q.resolve(soynode.render(name, data))
}

module.exports = {
  TemplateManager: TemplateManager
}