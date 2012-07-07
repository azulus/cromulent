/**
 * @fileoverview Unit tests for TemplateManager class.
 */

var path = require('path')
var testCase = require('nodeunit').testCase
var TemplateManager = require("../lib/templates").TemplateManager

var templates = null

module.exports = testCase({
  setUp: function (done) {
    templates = new TemplateManager()
    templates.dirs.push(path.join(__dirname, 'templates/common'))
    templates.dirs.push(path.join(__dirname, 'templates/pages'))
    templates.compile().then(function () {
      done()
    }).end()
  }, 

  /**
   * Tests that templates render correctly.
   */
  testRender: function (test) {
    test.equal(templates.render('common.pages.home', {name: "Jeremy"}),
        '<html><body>Hello, Jeremy!</body></html>')
    test.equal(templates.render('common.pages.header', {}), '<html><body>')
    test.equal(templates.render('common.pages.footer', {}), '</body></html>')
    test.done()
  }
})
