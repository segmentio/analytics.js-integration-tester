
/**
 * Module dependencies.
 */

var Integration = require('analytics.js-integration');
var Assertion = require('./assertion');
var indexOf = require('indexof');
var types = require('./types');
var assert = require('assert');
var equal = require('equals');
var each = require('each');
var is = require('is');

/**
 * Override-able methods
 */

var methods = [
  'alias',
  'group',
  'identify',
  'initialize',
  'load',
  'loaded',
  'map',
  'page',
  'track'
];

/**
 * Base integration class
 */

var Base = Integration('Base');

/**
 * Expose `Tester`.
 */

exports = module.exports = Tester;

/**
 * Expose `Assertion`
 */

exports.Assertion = Assertion;

/**
 * Expose `types`.
 */

exports.types = types;

/**
 * Initialize a new `Tester`.
 *
 * @param {Integration} integration
 */

function Tester(integration) {
  if (!(this instanceof Tester)) return new Tester(integration);
  this.integration = integration;

  // make sure no private methods have been overriden on the prototype
  for (var property in integration) {
    var override = integration[property];
    var parent = Base.prototype[property];
    if (indexOf(methods, property) > -1) continue; // public method
    if (!parent) continue;
    if (typeof override !== 'function') continue;
    assert(String(override) === String(parent), 'Don\'t override the "'
      + property + '" method from the base integration.');
  }
}

/**
 * Assert that the integration's name is `string`.
 *
 * @param {String} name
 * @return {Tester}
 */

Tester.prototype.name = function(string){
  var name = this.integration.name;
  assert(
    string === name,
    'Expected name to be "' + string + '", but it was "' + name + '".'
  );
  return this;
};

/**
 * Assert that the integration has a global `key`.
 *
 * @param {String} key
 * @return {Tester}
 */

Tester.prototype.global = function(key){
  assert(
    indexOf(this.integration.globals, key) !== -1,
    'Expected global "' + key + '" to be registered.'
  );
  return this;
};

/**
 * Assert that the integration has an option `key` with a default `value`.
 *
 * @param {String} key
 * @param {Mixed} value
 * @return {Tester}
 */

Tester.prototype.option = function(key, value){
  var val = this.integration.defaults[key];
  var obj = is.object(val) || is.array(val);
  assert(
    obj ? equal(val, value) : val === value,
    'Expected option "' + key + '" to default to "' + value + '", but it defaults to "'+ val + '".'
  );
  return this;
};

/**
 * Assert that the integration has `mapping` of `name`.
 *
 * @param {String} name
 * @return {Tester}
 */

Tester.prototype.mapping = function(name){
  return this.option(name, []);
};

/**
 * Assert that the integration assumes a pageview.
 *
 * @return {Tester}
 */

Tester.prototype.assumesPageview = function(){
  assert(
    this.integration._assumesPageview,
    'Expected the integration to assume a pageview.'
  );
  return this;
};

/**
 * Assert that the integration is ready on initialize.
 *
 * @return {Tester}
 */

Tester.prototype.readyOnInitialize = function(){
  assert(
    this.integration._readyOnInitialize,
    'Expected the integration to be ready on initialize.'
  );
  return this;
};

/**
 * Assert that the integration is ready on load.
 *
 * @return {Tester}
 */

Tester.prototype.readyOnLoad = function(){
  assert(
    this.integration._readyOnLoad,
    'Expected integration to be ready on load.'
  );
  return this;
};

/**
 * Call initialize and return an `Assertion`.
 *
 * @return {Assertion}
 * @api public
 */

Tester.prototype.initialize = function(){
  var ret = this.integration.initialize();
  return new Assertion(ret);
};

/**
 * Assert that the integration loads correctly.
 *
 * @param {Function} fn
 * @retrun {Tester}
 */

Tester.prototype.loads = function(fn){
  var loaded = this.integration.loaded();
  var name = this.integration.name;
  if (loaded) return fn(new Error('"' + name + '" is already loaded'));
  this.integration.load(fn);
  return this;
};

/**
 * Call one of the core tracking methods, wrapping the arguments in a facade,
 * and return an `Assertion`.
 *
 * @return {Assertion}
 * @api public
 */

each(types, function(type, fn){
  Tester.prototype[type] = function(){
    var facade = fn.apply(null, arguments);
    var ret = this.integration[type](facade);
    return new Assertion(ret);
  };
});
