var assert = require('assert')
var Router = require('../lib/router').Router

var router = new Router

router.when('GET /')
router.when('GET /friends')
router.when('PUT /friends/:userId')
router.when('DELETE /friends/:userId')
router.when('GET /user/:userId')
router.when('GET /user/:userId/history')
router.when('GET /user/me')
router.when('GET /user/me/history')
router.when('PUT /user/me/settings')
router.when('GET /template/*')

testRouter('GET', '/', ['GET'], '/', {})
testRouter('GET', '/bad', null, null, null)
testRouter('GET', '/friends', ['GET'], '/friends', {})
testRouter('PUT', '/friends/abc', ['PUT'], '/friends/:userId', {userId: 'abc'})
testRouter('DELETE', '/friends/abc', ['DELETE'], '/friends/:userId', {userId: 'abc'})
testRouter('GET', '/user/abc', ['GET'], '/user/:userId', {userId: 'abc'})
testRouter('GET', '/user/abc/history', ['GET'], '/user/:userId/history', {userId: 'abc'})
testRouter('GET', '/user/me', ['GET'], '/user/me', {})
testRouter('GET', '/user/me/history', ['GET'], '/user/me/history', {})
testRouter('PUT', '/user/me/settings', ['PUT'], '/user/me/settings', {})
testRouter('GET', '/template/abc.html', ['GET'], '/template/*', {'*': 'abc.html'})
testRouter('GET', '/template/test1/abc.html', ['GET'], '/template/*', {'*': 'test1/abc.html'})
testRouter('GET', '/template/test1/test2/abc.html', ['GET'], '/template/*', {'*': 'test1/test2/abc.html'})

function testRouter(method, path, expectedMethods, expectedPath, expectedParams) {
	try {
		var route = router.find(method, path)
		if (expectedMethods === null) {
			assert.equal(null, route)
		} else {
			assert.deepEqual(route.methods, expectedMethods)
			assert.equal(route.path, expectedPath)
			if (expectedParams) {
				assert.deepEqual(route.getParams(path), expectedParams)
			}
		}
		console.log("Test for " + method + " " + path + " succeeded")
	} catch (e) {
		console.error("Test for " + method + " " + path + " failed", e)
	}
}
