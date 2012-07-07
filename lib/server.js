var composers = require('composers')
var q = require('q')
var variants = require('variants')

var ModuleLoader = require('./modules').ModuleLoader
var Router = require('./router').Router
var TemplateManager = require('./templates').TemplateManager

// run the actual server

function Server() {
  this.configOptions = {}
  this.registry = new composers.Registry()

	this.router = new Router()
  this.templates = new TemplateManager()
  this.moduleLoader = new ModuleLoader(this.registry)
}

Server.prototype.loadVariants = function (file) {
  var d = q.defer()
  variants.loadFile(file, d.makeNodeResolver())
  return d.promise.then(this._onLoadVariants.bind(this))
}

Server.prototype._onLoadVariants = function () {
  variants.getAllFlags().forEach(function (flag) {
    this.registry
    .defineNode()
    .outputs('variant.' + flag)
    .given('variants-request-context')
    .with(function (context) {
      return variants.getFlagValue(flag, context.get())
    })
    .build()
  }.bind(this))
}

Server.prototype.config = function (key, value) {
  if (value) this.configOptions[key] = value
  return this.configOptions[key]
}

module.exports = {
  Server: Server
}