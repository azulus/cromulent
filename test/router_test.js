/**
 * @fileoverview Unit tests for Router class.
 */

var assert = require('assert')
var nodeunit = require('nodeunit')
var path = require('path')
var testCase = nodeunit.testCase
var Router = require('../lib/router').Router

var router = new Router

function testRouter(method, path, expectedMethods, expectedPath, expectedParams) {
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
}

module.exports = testCase({
  setUp: function (done) {
  	router = new Router()
    done()
  }, 

  /**
   * Tests that the Router works as expected.
   */
  testRouting: function (test) {
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
    test.done()
  }
})
