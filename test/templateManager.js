var path = require('path')
var assert = require('assert')
var TemplateManager = require("../lib/templateManager")

var templates = new TemplateManager()
templates.dirs.push(path.join(__dirname, 'templates/common'))
templates.dirs.push(path.join(__dirname, 'templates/pages'))

templates
  .compile()
  .then(renderTemplate('common.pages.home', {name: "Jeremy"}))
  .then(validateOutput('<html><body>Hello, Jeremy!</body></html>'))
  .then(renderTemplate('common.pages.header', {}))
  .then(validateOutput('<html><body>'))
  .then(renderTemplate('common.pages.footer', {}))
  .then(validateOutput('</body></html>'))
  .fail(function (e) {
    console.error(e)
  })

function renderTemplate(name, data) {
  return function () {
    return templates.render(name, data)
  }
}

function validateOutput(expectedOutput) {
  return function (output) {
    assert.equal(output, expectedOutput)
    console.log("Test for " + expectedOutput + " succeeded")
    return true
  }
}