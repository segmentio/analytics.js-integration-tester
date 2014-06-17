
/**
 * Module dependencies.
 */

var equals = require('equals');
var assert = require('assert');
var has = ({}).hasOwnProperty;
var fmt = require('fmt');

/**
 * Expose `Assertion`.
 */

module.exports = Assertion;

/**
 * Initialize `Assertion`.
 *
 * @api private
 */

function Assertion(ret){
  if (!(this instanceof Assertion)) return new Assertion(ret);
  this.ret = ret;
}

/**
 * Assert that the integration called `spy`.
 *
 * Example:
 *
 *      assert(amplitude)
 *      .track('event', { baz: true })
 *      .called(window.amplitude.logEvent)
 *      .with('event', { baz: true });
 *
 * @param {Spy} spy
 * @api public
 */

Assertion.prototype.called = function(spy){
  assert(spy.called, 'Expected "' + spy.name + '" to have been called.');
  this.spy = spy;
  return this;
};

/**
 * Assert that the spy was called with `args`.
 *
 * @param {...} args
 * @return {Assertion}
 * @api public
 */

Assertion.prototype.args = function(){
  var args = [].slice.call(arguments);

  assert(has.call(this, 'spy'), 'You must call `.called(spy)` prior to calling `.args()`.');
  assert(this.spy.calledWith.apply(this.spy, args), fmt(''
    + 'Expected "%s" to be called with "%o", '
    + 'but it was called with "%o".'
    , this.spy.name, args
    , this.spy.args[0]));

  delete this.spy;
  return this;
};

/**
 * Assert that the changed `obj` to eql optional `value`.
 *
 *     assert(rollbar)
 *    .identify(null, { trait: true })
 *    .changed(window._rollbar.extraParams)
 *    .to({ person: { trait: true } });
 *
 * @param {Object} from
 * @param {Object} to
 * @return {Assertion}
 * @api public
 */

Assertion.prototype.changed = function(from, to){
  this.from = from;
  return 1 == arguments.length
    ? this
    : this.to(to);
};

/**
 * Assert that `from` was changed to `value`.
 *
 * @param {Mixed} value
 * @return {Assertion}
 * @api public
 */

Assertion.prototype.to = function(value){
  assert(has.call(this, 'from'), 'You must call `.changed(value)` prior to calling `.to()`.');
  assert.deepEqual(this.from, value, fmt('Expected %o to deep equal %o.', this.from, value));
  delete this.from;
  return this;
};
