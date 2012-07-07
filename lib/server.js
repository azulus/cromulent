var Router = require('./router').Router
var TemplateManager = require('./templates').TemplateManager
var ModuleLoader = require('./modules').ModuleLoader

// run the actual server

function Server() {
	this.router = new Router()
  this.templates = new TemplateManager()
  this.moduleLoader = new ModuleLoader
	this.configOptions = {}
}

Server.prototype.config = function (key, value) {
  if (value) this.configOptions[key] = value
  return this.configOptions[key]
}

Server.prototype.start = function () {

}

module.exports = {
  Server: Server
}