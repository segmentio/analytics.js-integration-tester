'use strict';

/*
 * Module dependencies.
 */

var JSON = require('json3');
var assert = require('proclaim');
var contains = require('@ndhoule/includes');
var domify = require('domify');
var each = require('@ndhoule/each');
var fmt = require('@segment/fmt');
var keys = require('@ndhoule/keys');
var spy = require('@segment/spy');
var stub = require('@segment/stub');
var type = require('component-type');
var waitForScripts = require('./waitForScripts');

/**
 * Integration testing plugin.
 *
 * @param {Analytics} analytics
 */
function plugin(analytics) {
  analytics.spies = [];

  /**
   * Spy on a `method` of host `object`.
   *
   * @param {Object} object
   * @param {string} method
   * @return {Analytics}
   */
  analytics.spy = function(object, method) {
    var s = spy(object, method);
    this.spies.push(s);
    return this;
  };

  /**
   * Stub a `method` of host `object`.
   *
   * @param {Object} object
   * @param {string} method
   * @param {Function} fn A function to be called in place of the stubbed method.
   * @return {Analytics}
   */
  analytics.stub = function(object, method, fn) {
    var s = stub(object, method, fn);
    this.spies.push(s);
    return this;
  };

  /**
   * Restore all spies.
   *
   * @return {Analytics}
   */
  analytics.restore = function() {
    each(function(spy) {
      spy.restore();
    }, this.spies);
    this.spies = [];
    return this;
  };

  /**
   * Assert that a `spy` was called with `args...`
   *
   * @param {Spy} spy
   * @param {*} [args...]
   * @return {Analytics}
   */
  analytics.called = function(spy) {
    assert(
      contains(spy, this.spies),
      'You must call `.spy(object, method)` prior to calling `.called()`.'
    );
    assert(spy.called, fmt('Expected "%s" to have been called.', spy.name));

    var args = Array.prototype.slice.call(arguments, 1);
    if (!args.length) return this;

    assert(
      spy.got.apply(spy, args),
      fmt(
        'Expected "%s" to be called with "%s", \n but it was called with "%s".',
        spy.name,
        JSON.stringify(args, null, 2),
        JSON.stringify(spy.args[0], null, 2)
      )
    );

    return this;
  };

  /**
   * Assert that a `spy` was not called with `args...`.
   *
   * @param {Spy} spy
   * @param {*} [args...]
   * @return {Analytics}
   */
  analytics.didNotCall = function(spy) {
    assert(
      contains(spy, this.spies),
      'You must call `.spy(object, method)` prior to calling `.didNotCall()`.'
    );

    var args = Array.prototype.slice.call(arguments, 1);
    if (!args.length) {
      assert(
        !spy.called,
        fmt('Expected "%s" not to have been called.', spy.name)
      );
    } else {
      assert(
        !spy.got.apply(spy, args),
        fmt('Expected "%s" not to be called with "%o", but it was called with "%o".', spy.name, args, spy.args[0])
      );
    }

    return this;
  };

  /**
   * Assert that a `spy` was not called 1 time.
   *
   * @param {Spy} spy
   * @return {Analytics}
   */
  analytics.calledOnce = calledTimes(1);

  /**
   * Assert that a `spy` was called 2 times.
   *
   * @param {Spy} spy
   * @return {Analytics}
   */
  analytics.calledTwice = calledTimes(2);

  /**
   * Assert that a `spy` was called 3 times.
   *
   * @param {Spy} spy
   * @return {Analytics}
   */
  analytics.calledThrice = calledTimes(3);

  /**
   * Generate a function for asserting a spy
   * was called `n` times.
   *
   * @param {number} n
   * @return {Function}
   */
  function calledTimes(n) {
    return function(spy) {
      var callCount = spy.args.length;
      assert(
        n === callCount,
        fmt(
          'Expected "%s" to have been called %s time%s, but it was only called %s time%s.',
          spy.name,
          n,
          n !== 1 ? 's' : '',
          callCount,
          callCount !== 1 ? 's' : ''
        )
      );
    };
  }

  /**
   * Assert that a `spy` returned `value`.
   *
   * @param {Spy} spy
   * @param {*} value
   * @return {Tester}
   */
  analytics.returned = function(spy, value) {
    assert(
      contains(spy, this.spies),
      'You must call `.spy(object, method)` prior to calling `.returned()`.'
    );
    assert(
      spy.returned(value),
      fmt('Expected "%s" to have returned "%o".', spy.name, value)
    );

    return this;
  };

  /**
   * Assert that a `spy` did not return `value`.
   *
   * @param {Spy} spy
   * @param {*} value
   * @return {Tester}
   */
  analytics.didNotReturn = function(spy, value) {
    assert(
      contains(spy, this.spies),
      'You must call `.spy(object, method)` prior to calling `.didNotReturn()`.'
    );
    assert(
      !spy.returned(value),
      fmt('Expected "%s" not to have returned "%o".', spy.name, value)
    );

    return this;
  };

  /**
   * Call `reset` on the integration.
   *
   * @return {Analytics}
   */
  analytics.reset = function() {
    this.user().reset();
    this.group().reset();
    return this;
  };

  /**
   * Compare `int` against `test`.
   *
   * To double-check that they have the right defaults, globals, and config.
   *
   * @param {Function} A actual integration constructor
   * @param {Function} B test integration constructor
   */
  analytics.compare = function(A, B) {
    var a = new A();
    var b = new B();
    // name
    assert(
      a.name === b.name,
      fmt('Expected name to be "%s", but it was "%s".', b.name, a.name)
    );

    // options
    var aDefaults = a.defaults;
    var bDefaults = b.defaults;
    // TODO(ndhoule): Confirm this can be an `each` call and convert it
    // eslint-disable-next-line guard-for-in
    for (var key in bDefaults) {
      assert(
        aDefaults.hasOwnProperty(key),
        fmt('The integration does not have an option named "%s".', key)
      );
      assert.deepEqual(
        aDefaults[key], bDefaults[key],
        fmt(
          'Expected option "%s" to default to "%s", but it defaults to "%s".',
          key, bDefaults[key], aDefaults[key]
        )
      );
    }

    // globals
    var aGlobals = a.globals;
    var bGlobals = b.globals;
    each(function(key) {
      assert(
        contains(key, aGlobals),
        fmt('Expected global "%s" to be registered.', key)
      );
    }, bGlobals);

    // assumesPageview
    assert(
      a._assumesPageview === b._assumesPageview,
      'Expected the integration to assume a pageview.'
    );

    // readyOnInitialize
    assert(
      a._readyOnInitialize === b._readyOnInitialize,
      'Expected the integration to be ready on initialize.'
    );

    // readyOnLoad
    assert(
      a._readyOnLoad === b._readyOnLoad,
      'Expected integration to be ready on load.'
    );
  };

  /**
   * Assert the integration being tested loads.
   *
   * @param {Integration} integration
   * @param {Function} done
   */
  analytics.load = function(integration, done) {
    analytics.assert(!integration.loaded(), 'Expected `integration.loaded()` to be false before loading.');
    analytics.once('ready', function() {
      analytics.assert(integration.loaded(), 'Expected `integration.loaded()` to be true after loading.');
      done();
    });
    analytics.initialize();
    analytics.page({}, { Marketo: true });
  };

  /**
   * Assert a script, image, or iframe was loaded.
   *
   * @param {string} str DOM template
   */

  analytics.loaded = function(integration, str) {
    if (typeof integration === 'string') {
      str = integration;
      integration = this.integration();
    }

    var tags = [];

    assert(
      contains(integration.load, this.spies),
      'You must call `.spy(integration, \'load\')` prior to calling `.loaded()`.'
    );

    // collect all Image or HTMLElement objects
    // in an array of stringified elements, for human-readable assertions.
    each(function(el) {
      var tag = {};
      if (el instanceof HTMLImageElement) {
        tag.type = 'img';
        tag.attrs = { src: el.src };
      } else if (type(el) === 'element') {
        tag.type = el.tagName.toLowerCase();
        tag.attrs = attributes(el);
        switch (tag.type) {
        case 'script':
          // don't care about these properties.
          delete tag.attrs.type;
          delete tag.attrs.async;
          delete tag.attrs.defer;
          break;
        case 'iframe':
          // don't care about these properties.
          delete tag.attrs.width;
          delete tag.attrs.height;
          delete tag.attrs.style;
          break;
        default:
          // no default case
        }
      }
      if (tag.type) tags.push(stringify(tag.type, tag.attrs));
    }, integration.load.returns);

    // normalize formatting
    var tag = objectify(str);
    var expected = stringify(tag.type, tag.attrs);

    if (!tags.length) {
      assert(false, fmt('No tags were returned.\nExpected %s.', expected));
    } else {
      // show the closest match
      assert(
        contains(expected, tags),
        fmt('\nExpected %s.\nFound %s', expected, tags.join('\n'))
      );
    }
  };

  /**
   * Get current integration.
   *
   * @return {Integration}
   */
  analytics.integration = function() {
    // TODO(ndhoule): Confirm this can be an `each` call and convert it
    // eslint-disable-next-line guard-for-in
    for (var name in this._integrations) {
      return this._integrations[name];
    }
  };

  /**
   * Assert a `value` is truthy.
   *
   * @param {*} value
   * @return {Tester}
   */
  analytics.assert = assert;

  /**
   * Wait for script elements to finish loading to avoid errors if they load
   * after a reset.
   *
   * @param {Function} callback
   */
  analytics.waitForScripts = waitForScripts;

  /**
   * Expose all of the methods on `assert`.
   *
   * @param {*} args...
   * @return {Tester}
   */
  each(function(key) {
    analytics[key] = function() {
      var args = Array.prototype.slice.call(arguments);
      assert[key].apply(assert, args);
      return this;
    };
  }, keys(assert));

  /**
   * Create a DOM node string.
   */
  function stringify(name, attrs) {
    var str = [];
    str.push('<' + name);
    each(function(val, key) {
      str.push(' ' + key + '="' + val + '"');
    }, attrs);
    str.push('>');
    // block
    if (name !== 'img') {
      str.push('</' + name + '>');
    }
    return str.join('');
  }

  /**
   * DOM node attributes as object.
   *
   * @param {Element}
   * @return {Object}
   */
  function attributes(node) {
    var obj = {};
    each(function(attr) {
      obj[attr.name] = attr.value;
    }, node.attributes);
    return obj;
  }

  /**
   * Given a string, give back DOM attributes.
   *
   * @param {string} str
   * @return {Object}
   */
  function objectify(str) {
    // replace `src` with `data-src` to prevent image loading
    str = str.replace(' src="', ' data-src="');

    var el = domify(str);
    var attrs = {};

    each(function(attr) {
      // then replace it back
      var name = attr.name === 'data-src' ? 'src' : attr.name;
      attrs[name] = attr.value;
    }, el.attributes);

    return {
      type: el.tagName.toLowerCase(),
      attrs: attrs
    };
  }
}

/*
 * Exports.
 */

module.exports = plugin;
