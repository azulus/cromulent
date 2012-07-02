var Router = require('./router')

// run the actual server

function Server() {
	this.router = new Router
}

module.exports = Server