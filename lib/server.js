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
  var addedNodes = {}
  var registry = this.registry

  variants.getAllVariants().forEach(function (v) {
    v.mods.forEach(function (mod) {
      if (addedNodes[mod.flagName]) return
      addedNodes[mod.flagName] = true

      registry
      .defineNode()
      .outputs('variant_flag-' + mod.flagName)
      .given('variant_flag_context-' + mod.flagName, 'variant_flag_forced-' + mod.flagName)
      .with(variants.getFlagValue.bind(variants, mod.flagName))
      .build()
    })
  })
}

Server.prototype.config = function (key, value) {
  if (value) this.configOptions[key] = value
  return this.configOptions[key]
}

module.exports = {
  Server: Server
}