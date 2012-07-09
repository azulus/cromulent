var composers = require('composers')
var http = require('http')
var q = require('q')
var variants = require('variants')

var ModuleLoader = require('./modules').ModuleLoader
var Router = require('./router').Router
var TemplateManager = require('./templates').TemplateManager

/**
 * Creates an instance of the cromulent server
 *
 * @constructor Server
 */
function Server() {
  this.configOptions = {}
  this.registry = new composers.Registry()
  variants.clearAll()

  this.httpServer = null
	this.router = new Router()
  this.templates = new TemplateManager()
  this.moduleLoader = new ModuleLoader(this.registry)
}

/**
 * Load in a variants file and add any variants to the composers
 * registry
 *
 * @param {String} file
 * @returns {Object} a promise which will resolve once the variants
 *     file has loaded and the variants have been loaded into the
 *     registry
 */
Server.prototype.loadVariants = function (file) {
  var d = q.defer()
  variants.loadFile(file, d.makeNodeResolver())
  return d.promise.then(this._onLoadVariants.bind(this))
}

/**
 * Load all flags in variants into the registry
 */
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

/**
 * Load a configuration value into the server, still a bit mixed
 * as to whether we should use this or not
 *
 * @param {String} key the key of the value to set and/or retrieve
 * @param {Object} value the value to set on the key if setting
 * @returns {Object} the value of the config options for the key
 */
Server.prototype.config = function (key, value) {
  if (value) this.configOptions[key] = value
  return this.configOptions[key]
}

/**
 * Start the cromulent web server
 */
Server.prototype.start = function () {
  if (this.httpServer) return

  if (this.configOptions['templateDir']) this.templates.dirs = [
    this.configOptions['templateDir']
  ]
  if (this.configOptions['moduleDir']) this.moduleLoader.dirs = [
    this.configOptions['moduleDir']
  ]

  return q.allResolved([
    this.templates.compile(),
    this.moduleLoader.load()
  ])
  .then(function () {
    var port = this.configOptions['port'] || 3000
    this.httpServer = http.createServer(function (req, res) {
      var route = this.router.find(req.method, req.url.split('?')[0])
      if (route) {
        route.handle(req, res, this.registry, this.templates)
        .fail(function (e) {
          console.error(e)
          res.statusCode = 500
          res.end()
        })
        .end()
      } else {
        res.statusCode = 404
        res.end()
      }
    }.bind(this))
    this.httpServer.listen(port)
  }.bind(this))
}

/**
 * Stop the cromulent web server
 */
Server.prototype.stop = function () {
  if (!this.httpServer) return q.resolve(true)
  var d = q.defer()
  this.httpServer.close(d.makeNodeResolver())
  return d.promise.then(function () {
    this.httpServer = null
  }.bind(this))
}

module.exports = {
  Server: Server
}