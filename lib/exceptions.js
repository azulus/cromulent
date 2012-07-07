/**
 * @fileoverview Provides a central registry of exception handlers. Exceptions can either be mapped
 * to http status codes or custom handlers that return an error response object. The idea is that
 * a common exception can be thrown and be mapped to 4xx or 5xx, along with the template object.
 * All 5xx errors are treated as system errors and get logged as such, while 4xx errors are
 * client errors and not treated nearly as severe.
 */

var soynode = require('soynode')

module.exports = {
    handle: handle
  , registerHttpStatus: registerHttpStatus
  , registerCustomHandler: registerCustomHandler
  , ErrorResponse: ErrorResponse
}


/**
 * Registered exception handlers.
 * @type {!Object.<function(Error)>}
 */
var handlers = {}


/**
 * Default exception handlers.
 * @type {function(Error)}
 */
var DEFAULT_HANDLER = function (err) {
  return new ErrorResponse(500, err.message)
}


/**
 * Registers the given error class with a handler that returns an ErrorResponse
 * @param {Function} errorClass
 * @param {number} httpStatus
 */
function registerHttpStatus(errorClass, httpStatus) {
  registerCustomHandler(errorClass, function (err) {
    return new ErrorResponse(httpStatus, err.message)
  })
}


/**
 * Registers the given error class with a handler that returns an ErrorResponse
 * @param {Function} errorClass
 * @param {Function(Error)=ErrorResponse} fn
 */
function registerCustomHandler(errorClass, fn) {
  var name = getErrorName(errorClass)
  if (name in handlers) {
    throw new Error('Error handler type already registered:', type)
  }
  handlers[name] = fn
}


/**
 * Handles the given error and returns a rendered error page.
 * @param {Error} err
 * @return {string} HTML
 */
function handle(err) {
  var response = getResponse(err)
  var templateName = 'errors.error' + response.httpStatus
  var template = soynode.get(templateName) || soynode.get('errors.unknownError')
  return template({
      status: response.httpStatus
    , debugInfo: response.debugMessage
  })
}


/**
 * Error response object returned by exception handlers.
 * @param {number} httpStatus
 * @param {string} debugMessage
 * @constructor
 */
function ErrorResponse(httpStatus, debugMessage) {
  /**
   * HTTP status code.
   * @type {number}
   */
  this.httpStatus = httpStatus

  /**
   * Debug-only message.
   * @type {string}
   */
  this.debugMessage = debugMessage
}


/**
 * Returns the error response object for the given error.
 * @param {Error} err
 * @return {ErrorResponse}
 */
function getResponse(err) {
  try {
    var handler = getHandler(err)
    var res = handler(err)
    if (res instanceof ErrorResponse) {
      return res
    }
    return DEFAULT_HANDLER(err)
  } catch (e) {
    // The error's error page, hurray.
    return DEFAULT_HANDLER(e)
  }
}


/**
 * Returns an exception handler for the given error.
 * @param {Error} err
 * @return {function(Error)}
 */
function getHandler(err) {
  var type = err.constructor
  while (type) {
    var name = getErrorName(type)
    if (name in handlers) {
      return handlers[name]
    }
    type = type.super_
  }
  return DEFAULT_HANDLER
}


/**
 * Returns the name for the given error class.
 * @param {Function} errorClass
 * @return {string}
 */
function getErrorName(errorClass) {
  if (!errorClass || !errorClass.name) {
    throw new Error('Invalid error type', errorClass)
  }
  return errorClass.name
}
