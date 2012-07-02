module.exports = {
	Server: require("./lib/server")
}

// Server.router.load(require('routes'))
// Server.templates.dirs.push(path.join(__dirname, 'templates'))
// Server.templates.compile('name', data)

// lazy loading vs startup-time initialization

// how does context work?

// how does profiling work?

// how does restarting work?

// where are the graph nodes

// where are the client-side js files?

// where are the static files

/**

1) define the modules w/ the graph nodes

2) define the routes which use those graph nodes

3) define the views to render something sane out from the routes

4) 

*/