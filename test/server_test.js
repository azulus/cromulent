/**
 * @fileoverview Unit tests for Server class.
 */

var http = require('http')
var path = require('path')
var q = require('q')
var testCase = require('nodeunit').testCase
var Server = require('../lib/server').Server

var server = null

module.exports = testCase({

  setUp: function (done) {
    server = new Server()
    server.config("port", 3000)
    server.config("templateDir", path.join(__dirname, "templates"))
    server.config("moduleDir", path.join(__dirname, "modules"))
    done()
  },

  tearDown: function (done) {
    server.stop().then(function () {
      done()
    })
  },

  /**
   * Tests that templates render and use the graph
   */
  testResponse: function (test) {
    var min = 1033
    var max = 1038

    // set up the route
    server.router.when('GET /')
      .given('randomNum')
      .with(function (graph, req) {
        graph.give('min', min)
        graph.give('max', max)
      })
      .render('common.pages.randomNum')

    // start the server
    server.start()

    // query for /
    .then(function () {
      var opts = {
        host: "localhost",
        port: 3000,
        path: '/',
        method: 'GET'
      }

      var d = q.defer()
      http.get(opts, function (res) {
        test.equal(res.statusCode, 200)

        var data = ''

        res.setEncoding('utf8')
        res.on('data', function (chunk) {
          data += chunk
        })
        res.on('end', function () {
          d.resolve(data)
        })
      }).on('error', function (e) {
        d.reject(e)
      })
      return d.promise
    })

    // make sure we have the right content
    .then(function (data) {
      var parts = data.split(':')
      test.equal(parts.length, 2)
      var randomNum = parseInt(parts[1], 10)
      test.equal(randomNum >= min && randomNum < max, true)
    })

    // done
    .then(function () {
      test.done()
    }).end()
  }

})