var Router = require('./router')
var TemplateManager = require('./templateManager')

// run the actual server

function Server() {
	this.router = new Router
  this.templates = new TemplateManager
	this.configOptions = {}
}

Server.prototype.config = function (key, value) {
  if (value) this.configOptions[key] = value
  return this.configOptions[key]
}

Server.prototype.start = function () {

}

module.exports = Server