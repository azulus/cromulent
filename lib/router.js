var q = require('q')
var Scope = require('composers').Scope

/**
 * Creates an instance of Route which defines a specific
 * route handler for a given method and path
 *
 * @param {Array.<String>} methods a list of http methods this route supports
 * @param {string} path the url path this route supports
 * @param {Object} captures a list of url capture fields for this route
 * @constructor
 */
function Route(methods, path, captures) {
	this.methods = methods
	this.path = path
	this.captures = captures
	this.captureArgs = 0
	this._given = []
	this._template = null
	this._bindFn = null
	for (var key in this.captures) {
		this.captureArgs += 1
	}
}

/**
 * Returns a list of captured fields given a path
 *
 * @param {string} path the url path
 * @return {Object} the fields captured from the url
 */
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

/**
 * Specifies that this route should produce this output through the provided
 * registry
 *
 * @params {string} given named output from the registry provided to handle()
 * @return {Route}
 */
Route.prototype.given = function (given) {
	this._given = given
	return this
}

/**
 * Specifies that this route should render its output through the template 
 * specified
 * 
 * @params {string} template the name of the template to render
 * @return {Route}
 */
Route.prototype.render = function (template) {
	this._template = template
	return this
}

/**
 * Allows this route to provide a handler which can be used to bind input
 * arguments to the current composer graph
 *
 * @param {Function} fn a function which will be called with the current
 *     scope and request for a given http request
 * @return {Route}
 */
Route.prototype.with = function (fn) {
	this._bindFn = fn
	return this
}

/**
 * Handles a given http request by creating a graph in the provided registry
 * and rendering outputs through the provided template manager
 *
 * @param {Object} req the http request
 * @param {Object} res the http response
 * @param {Object} registry a composers registry
 * @param {Object} templateManager a TemplateManager instance
 * @return {Object} a promise which will resolve if the request is succesfully
 *     handled
 */
Route.prototype.handle = function (req, res, registry, templateManager) {
	var p
	var self = this

	// load data from the graph
	if (this._given) {
		var d = q.defer()
		var scope = new Scope(registry)
  	scope.enter()
  	var graph = scope.createGraph(this._given)

  	// if there's a bind function, use it to attach request data to the
  	// scope
  	if (this._bindFn) this._bindFn(graph, req)

  	// retrieve the needed data
  	graph.start().then(function (output) {
  		var data = {}
  		data[this._given] = output
  		d.resolve(data)
  	}.bind(this))
  	p = d.promise
	} else {
		p = q.resolve({})
	}

	// render out html
	if (this._template) {
		p = p.then(function (data) {
			res.setHeader("Content-Type", "text/html")
			return templateManager.render(self._template, data)
		})

	} else {
		// render out the json
		p = p.then(function (data) {
			res.setHeader("Content-Type", "application/json")
			return JSON.stringify(data)
		})
	}

	// write the body out
	return p.then(function (data) {
		res.statusCode = 200
		res.setHeader("Content-Length", data.length)
		res.end(data, 'utf8')
	})
}

/**
 * Create an instance of RouterNode which is used to handle the tree
 * structure needed for efficient route parsing
 *
 * @constructor
 */
function RouterNode() {
	this._children = {}
	this._handler = null
}

/**
 * Returns a list of children for this node which match a specific
 * name. Optionally creates children if they don't exist.
 *
 * @param {Array.<string>} names names of children to load
 * @param {boolean} shouldCreate whether to create non-existent children
 *     for provided names
 * @return {Array.<RouterNode>} an array of child RouterNode instances
 *     that match the provided names
 */
RouterNode.prototype.children = function (names, shouldCreate) {
	return names.map(function (name) {
		if (!this._children[name] && shouldCreate) this._children[name] = new RouterNode()
		return this._children[name]
	}, this)
}

/**
 * Add a Route instance to this RouterNode
 * 
 * @param {Route} route the route to add
 */
RouterNode.prototype.addHandler = function (route) {
	this._handler = route
}

/**
 * Get the Route instance attached to this RouterNode
 *
 * @return {Route} the route attached to this node
 */
RouterNode.prototype.getHandler = function () {
	return this._handler
}

/**
 * Creates an instance of Router which takes in a list of routes and provides
 * tree-based path routing
 *
 * @constructor 
 */
function Router() {
	this.routes = {}
}

/**
 * Takes in a function which it calls with a reference to itself for route loading
 *
 * @param {Function} fn the function to call with this Router as the first param
 */
Router.prototype.load = function (fn) {
	fn(this)
}

/**
 * Creates a Route instance inside of the tree of RouterNode instances which will
 * handle requests to the specified route
 *
 * @param {string} path the url path
 */
Router.prototype.when = function (path) {
	var parts = path.split(' ')
	var methods = parts.length === 1 ? ['GET'] : parts[0].split(',')
	var path = parts.length === 1 ? parts[0] : parts[1]

  // trim the / if needed
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

/**
 * Takes in an http method and path and returns a Route if any match
 *
 * @params {string} method the http method
 * @params {string} path the path
 * @return {Route} the matched route, if any
 */
Router.prototype.find = function (method, path) {
	if (!this.routes[method]) return null
	var handlers = []
	
	// remove the leading slash if need be
	if (path.length && path.substr(0, 1) === '/') path = path.substr(1)
	var pathParts = path.split('/')

  // best matched route so far
	var route

  // grab all routers for this http method
	var routers = [this.routes[method]]

	// iterate through each part of the path (split on /)
	for (var i = 0; routers.length && i < pathParts.length; i += 1) {
		var part = pathParts[i]
		var newRouters = []

		// for each router, check if anything matches this path
		for (var j = 0; j < routers.length; j += 1) {
			var router = routers[j]
			var children, k
			var children

			// check if any wildcard routes match this path
			children = router.children(['*'])
			for (k = 0; k < children.length; k += 1) {
				var child = children[k]
				if (child) {
					var handler = child.getHandler()

					// wildcard routes will match to the end of the url, so we set our
					// best route here
					if (handler) route = handler
				}
			}

			// check if any specific paths or named variable paths match this route
			children = router.children([':', part])
			for (k = 0; k < children.length; k += 1) {
				var child = children[k]
				if (child) {
					newRouters.push(child)
				}
			}
		}

		// update the routers list with any routers that matched this part of the path
		routers = newRouters
	}

  // any routes that have survived to the end are the most specific matches
	if (routers.length) {
		// loop through all matching routers and set the best route to their handlers
		// if they have one
		for (var i=0; i < routers.length; i += 1) {
			var handler = routers[i].getHandler()
			if (handler) route = handler
		}
	}

	if (!route) return null
	return route
}

module.exports = {
	Router: Router
}