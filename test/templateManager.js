var path = require('path')
var assert = require('assert')
var TemplateManager = require("../lib/templateManager")

var templates = new TemplateManager()
templates.dirs.push(path.join(__dirname, 'templates'))

templates
  .compile()
  .then(renderTemplate('test.simple.home', {name: "Jeremy"}))
  .then(validateOutput('<html><body>Hello, Jeremy!</body></html>'))
  .then(renderTemplate('test.simple.header', {}))
  .then(validateOutput('<html><body>'))
  .then(renderTemplate('test.simple.footer', {}))
  .then(validateOutput('</body></html>'))

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