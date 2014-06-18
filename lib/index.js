
/**
 * Module dependencies.
 */

var assert = require('assert');
var each = require('each');
var equal = require('equals');
var fmt = require('fmt');
var indexOf = require('indexof');
var Integration = require('analytics.js-integration');
var is = require('is');
var keys = require('keys');
var types = require('./types');
var spy = require('spy');

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
  this.spies = [];

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
  var def = this.integration.defaults;
  var has = def.hasOwnProperty(key);
  assert(has, 'The integration does not have an option named "' + key + '".');

  var val = def[key];
  assert.deepEqual(
    val, value,
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
 * Spy on a `method` of host `object`.
 *
 * @param {Object} object
 * @param {String} method
 * @return {Tester}
 */

Tester.prototype.spy = function(object, method){
  var s = spy(object, method);
  this.spies.push(s);
  return this;
};

/**
 * Stub a `method` of a host `object`.
 *
 * @param {Object} object
 * @param {String} method
 * @return {Tester}
 */

Tester.prototype.stub = function(object, method){
  // TODO
  // var s = stub(object, method);
  // this.spies.push(s);
  return this;
};

/**
 * Assert that a `spy` was called with `args...`
 *
 * @param {Spy} spy
 * @param {Mixed} args... (optional)
 * @return {Tester}
 */

Tester.prototype.called = function(spy){
  assert(~indexOf(this.spies, spy), 'You must call `.spy(object, method)` prior to calling `.called()`.');
  assert(spy.called, 'Expected "' + spy.name + '" to have been called.');

  var args = [].slice.call(arguments, 1);
  if (!args.length) return this;

  assert(spy.got.apply(spy, args), fmt(''
    + 'Expected "%s" to be called with "%o", '
    + 'but it was called with "%o".'
    , spy.name
    , args
    , spy.args[0]));

  return this;
};

/**
 * Assert that a `spy` was not called with `args...`.
 *
 * @param {Spy} spy
 * @param {Mixed} args... (optional)
 * @return {Tester}
 */

Tester.prototype.didntCall = function(spy){
  assert(~indexOf(this.spies, spy), 'You must call `.spy(object, method)` prior to calling `.didntCall()`.');

  var args = [].slice.call(arguments, 1);
  if (!args.length) {
    assert(!spy.called, 'Expected "' + spy.name + '" not to have been called.');
  } else {
    assert(!spy.got.apply(spy, args), fmt(''
      + 'Expected "%s" not to be called with "%o", '
      + 'but it was called with "%o".'
      , spy.name
      , args
      , spy.args[0]));
  }

  return this;
};

/**
 * Assert that a `spy` returned `value`.
 *
 * @param {Spy} spy
 * @param {Mixed} value
 * @return {Tester}
 */

Tester.prototype.returned = function(spy, value){
  assert(~indexOf(this.spies, spy), 'You must call `.spy(object, method)` prior to calling `.returned()`.');
  assert(spy.returned(value), fmt(''
    + 'Expected "%s" to have returned "%o".'
    , spy.name
    , value));

  return this;
};

/**
 * Assert that a `spy` did not return `value`.
 *
 * @param {Spy} spy
 * @param {Mixed} value
 * @return {Tester}
 */

Tester.prototype.didntReturn = function(spy, value){
  assert(~indexOf(this.spies, spy), 'You must call `.spy(object, method)` prior to calling `.didntReturn()`.');
  assert(!spy.returned(value), fmt(''
    + 'Expected "%s" not to have returned "%o".'
    , spy.name
    , value));

  return this;
};

/**
 * Restore all spies and stubs.
 *
 * @return {Tester}
 */

Tester.prototype.restore = function(){
  each(this.spies, function(s){ s.restore(); });
  this.spies = [];
  return this;
};

/**
 * Call initialize on the integration.
 *
 * @return {Tester}
 */

Tester.prototype.initialize = function(){
  this.integration.initialize();
  return this;
};

/**
 * Call reset on the integration.
 *
 * @return {Tester}
 */

Tester.prototype.reset = function(){
  this.integration.reset();
  return this;
};

/**
 * Set an `option` on the integration to a `value`.
 *
 * @param {String} option
 * @param {Mixed} value
 * @return {Tester}
 */

Tester.prototype.set = function(key, value){
  this.integration.options[key] = value;
  return this;
};

/**
 * Assert that the integration loads correctly.
 *
 * @param {Function} fn
 * @return {Tester}
 */

Tester.prototype.load = function(fn){
  assert(!this.integration.loaded(), 'The integration is already loaded.');
  this.integration.load(function(err){
    if (!err) return fn(new Error('An error occurred while loading the integration.'));
    if (!integration.loaded()) return fn(new Error('The integration called back from loading, but `.loaded()` returned false.'));
    fn();
  });
  return this;
};

/**
 * Call one of the core tracking methods, wrapping the arguments in a facade.
 *
 * @param {Mixed} args...
 * @return {Tester}
 */

each(types, function(type, fn){
  Tester.prototype[type] = function(){
    var facade = fn.apply(null, arguments);
    var ret = this.integration[type](facade);
    return this;
  };
});

/**
 * Assert a `value` is truthy.
 *
 * @param {Mixed} value
 * @return {Tester}
 */

Tester.prototype.assert = function(value){
  assert(value);
  return this;
};

/**
 * Expose all of the methods own `assert`.
 *
 * @param {Mixed} args...
 * @return {Tester}
 */

each(keys(assert), function(key){
  Tester.prototype[key] = function(){
    var args = [].slice.call(arguments);
    assert[key].apply(assert, args);
    return this;
  };
});