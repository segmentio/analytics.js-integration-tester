
var has = ({}).hasOwnProperty;
var equals = require('equals');
var assert = require('assert');

/**
 * Expose `Assertion`
 */

module.exports = Assertion;

/**
 * Initialize `Assertion`
 *
 * @api private
 */

function Assertion(){
  if (!(this instanceof Assertion)) return new Assertion;
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
  assert(spy.called, 'Expected "' + spy.name + '" to be called');
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

Assertion.prototype['with'] = function(){
  var args = [].slice.call(arguments);

  assert(has.call(this, 'spy'), 'you must call .called(spy) prior to calling this method.');
  assert(this.spy.calledWith.apply(this.spy, args), ''
    + 'Expected "' + this.spy.name + '" to be called with "'
    + args + '" but it was called with "'
    + this.spy.args[0]
    + '"');

  delete this.spy;
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
  if (1 == arguments.length) {
    this.from = from;
    return this;
  }

  assert(equals(from, to), 'Expected "' + from + '" to eql "' + to + '"');
  return this;
};

/**
 * Assert that `from` was changed to `value`.
 *
 * @param {Mixed} value
 * @return {Assertion}
 * @api public
 */

Assertion.prototype.to = function(value){
  assert(has.call(this, 'from'), 'you must call .changed(value) prior to calling this method');
  assert(equals(this.from, value), 'Expected ' + this.from + ' to eql ' + value);
  delete this.from;
  return this;
};
