// client + server side routing

function Route(methods, path, captures) {
	this.methods = methods
	this.path = path
	this.captures = captures
	this.captureArgs = 0
	for (var key in this.captures) {
		this.captureArgs += 1
	}
}

Route.prototype.getParams = function (path) {
	if (!this.captureArgs) return {}

	var params = {}
	var newPath = path.length && path.substr(0, 1) === '/' ?  path.substr(1) : path
	var pathParts = newPath.split('/')

	for (var key in this.captures) {
		if (this.captures[key] === '*') {
			params[this.captures[key]] = pathParts.slice(key).join('/')
		} else {
			params[this.captures[key]] = pathParts[key]
		}
	}
	return params
}

Route.prototype.produce = function () {
	return this
}

Route.prototype.provide = function () {
	return this
}

Route.prototype.render = function (template) {
	return this
}

Route.prototype.then = function (fn) {
	return this
}

function RouterNode() {
	this._children = {}
	this._handler = null
}

RouterNode.prototype.children = function (names, shouldCreate) {
	return names.map(function (name) {
		if (!this._children[name] && shouldCreate) this._children[name] = new RouterNode()
		return this._children[name]
	}, this)
}

RouterNode.prototype.addHandler = function (route) {
	this._handler = route
}

RouterNode.prototype.getHandler = function () {
	return this._handler
}

function Router() {
	this.routes = {}
}

Router.prototype.find = function (method, path) {
	if (!this.routes[method]) return null
	var handlers = []
	
	if (path.length && path.substr(0, 1) === '/') path = path.substr(1)
	var pathParts = path.split('/')
	var route

	var routers = [this.routes[method]]
	for (var i = 0; routers.length && i < pathParts.length; i += 1) {
		var part = pathParts[i]
		var newRouters = []

		for (var j = 0; j < routers.length; j += 1) {
			var router = routers[j]
			var children, k
			var children

			// start with the wildcard
			children = router.children(['*'])
			for (k = 0; k < children.length; k += 1) {
				var child = children[k]
				if (child) {
					var handler = child.getHandler()
					if (handler) route = handler
				}
			}

			children = router.children([':', part])
			for (k = 0; k < children.length; k += 1) {
				var child = children[k]
				if (child) {
					newRouters.push(child)
				}
			}
		}

		routers = newRouters
	}

	if (routers.length) {
		for (var i=0; i < routers.length; i += 1) {
			var handler = routers[i].getHandler()
			if (handler) route = handler
		}
	}

	if (!route) return null
	return route
}

Router.prototype.load = function (fn) {
	fn(this)
}

Router.prototype.when = function (path) {
	var parts = path.split(' ')
	var methods = parts.length === 1 ? ['GET'] : parts[0].split(',')
	var path = parts.length === 1 ? parts[0] : parts[1]

	var usablePath = (path.length && path.substr(0, 1) === '/')  ? path.substr(1) : path
	var pathParts = usablePath.split('/')
	var captures = {}
	
	// create the route tree
	var nodes = methods.map(function (method) {
		if (!this.routes[method]) this.routes[method] = new RouterNode()
		return this.routes[method]
	}, this)

	// for each node in the tree
	var idx = 0
	var done = false
	pathParts.forEach(function (part) {
		if (done) return
		var nodePatterns

		// end of the match, capture the rest of the output
		if (part === '*') {
			nodePatterns = ['*']
			captures[idx] = '*'
			done = true

		// capture this argument
		} else if (part.length && part.substr(0, 1) === ':') {
			nodePatterns = [':']
			captures[idx] = part.substr(1)

		// everything else
		} else {
			nodePatterns = part.split('|')
		}

		// load the nodes based on the predefined capture
		newNodes = []
		nodes.forEach(function (node) {
			node.children(nodePatterns, true).forEach(function (child) {
				newNodes.push(child)
			})
		})

		idx += 1
		nodes = newNodes
	})

	var route = new Route(methods, path, captures)

	nodes.forEach(function (node) {
		node.addHandler(route)
	})

	return route
}

module.exports = {
	Router: Router
}