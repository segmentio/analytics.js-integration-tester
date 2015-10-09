
/**
 * Module dependencies.
 */

var indexOf = require('indexof');
var assert = require('assert');
var domify = require('domify');
var stub = require('stub');
var each = require('each');
var keys = require('keys');
var fmt = require('fmt');
var spy = require('spy');
var is = require('is');

/**
 * Expose `plugin`.
 */

module.exports = plugin;

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
   * @param {String} method
   * @return {Analytics}
   */

  analytics.spy = function(object, method){
    var s = spy(object, method);
    this.spies.push(s);
    return this;
  };

  /**
   * Stub a `method` of host `object`.
   *
   * @param {Object} object
   * @param {String} method
   * @param {Function} fn A function to be called in place of the stubbed method.
   * @return {Analytics}
   */

  analytics.stub = function(object, method, fn){
    var s = stub(object, method, fn);
    this.spies.push(s);
    return this;
  };

  /**
   * Restore all spies.
   *
   * @return {Analytics}
   */

  analytics.restore = function(){
    each(this.spies, function(spy, i){
      spy.restore();
    });
    this.spies = [];
    return this;
  };

  /**
   * Assert that a `spy` was called with `args...`
   *
   * @param {Spy} spy
   * @param {Mixed} args... (optional)
   * @return {Analytics}
   */

  analytics.called = function(spy){
    assert(
      ~indexOf(this.spies, spy),
      'You must call `.spy(object, method)` prior to calling `.called()`.'
    );
    assert(spy.called, fmt('Expected "%s" to have been called.', spy.name));

    var args = [].slice.call(arguments, 1);
    if (!args.length) return this;

    assert(
      spy.got.apply(spy, args), fmt(''
      + 'Expected "%s" to be called with "%s", \n'
      + 'but it was called with "%s".'
      , spy.name
      , JSON.stringify(args, null, 2)
      , JSON.stringify(spy.args[0], null, 2))
    );

    return this;
  };

  /**
   * Assert that a `spy` was not called with `args...`.
   *
   * @param {Spy} spy
   * @param {Mixed} args... (optional)
   * @return {Analytics}
   */

  analytics.didNotCall = function(spy){
    assert(
      ~indexOf(this.spies, spy),
      'You must call `.spy(object, method)` prior to calling `.didNotCall()`.'
    );

    var args = [].slice.call(arguments, 1);
    if (!args.length) {
      assert(
        !spy.called,
        fmt('Expected "%s" not to have been called.', spy.name)
      );
    } else {
      assert(!spy.got.apply(spy, args), fmt(''
        + 'Expected "%s" not to be called with "%o", '
        + 'but it was called with "%o".'
        , spy.name
        , args
        , spy.args[0])
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

  analytics.calledThrice = calledTimes(2);

  /**
   * Generate a function for asserting a spy
   * was called `n` times.
   *
   * @param {Number} n
   * @return {Function}
   */

  function calledTimes(n) {
    return function(spy) {
      var m = spy.args.length;
      assert(
        n == m,
        fmt(''
          + 'Expected "%s" to have been called %s time%s, '
          + 'but it was only called %s time%s.'
          , spy.name, n, 1 != n ? 's' : '', m, 1 != m ? 's' : '')
      );
    }
  }

  /**
   * Assert that a `spy` returned `value`.
   *
   * @param {Spy} spy
   * @param {Mixed} value
   * @return {Tester}
   */

  analytics.returned = function(spy, value){
    assert(
      ~indexOf(this.spies, spy),
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
   * @param {Mixed} value
   * @return {Tester}
   */

  analytics.didNotReturn = function(spy, value){
    assert(
      ~indexOf(this.spies, spy),
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

  analytics.reset = function(){
    this.user().reset();
    this.group().reset();
    return this;
  };

  /**
   * Compare `int` against `test`.
   *
   * To double-check that they have the right defaults, globals, and config.
   *
   * @param {Function} a actual integration constructor
   * @param {Function} b test integration constructor
   */

  analytics.compare = function(a, b){
    a = new a;
    b = new b;
    // name
    assert(
      a.name === b.name,
      fmt('Expected name to be "%s", but it was "%s".', b.name, a.name)
    );

    // options
    var x = a.defaults;
    var y = b.defaults;
    for (var key in y) {
      assert(
        x.hasOwnProperty(key),
        fmt('The integration does not have an option named "%s".', key)
      );
      assert.deepEqual(
        x[key], y[key],
        fmt(
          'Expected option "%s" to default to "%s", but it defaults to "%s".',
          key, y[key], x[key]
        )
      );
    }

    // globals
    var x = a.globals;
    var y = b.globals;
    each(y, function(key){
      assert(
        indexOf(x, key) !== -1,
        fmt('Expected global "%s" to be registered.', key)
      );
    });

    // assumesPageview
    assert(
      a._assumesPageview == b._assumesPageview,
      'Expected the integration to assume a pageview.'
    );

    // readyOnInitialize
    assert(
      a._readyOnInitialize == b._readyOnInitialize,
      'Expected the integration to be ready on initialize.'
    );

    // readyOnLoad
    assert(
      a._readyOnLoad == b._readyOnLoad,
      'Expected integration to be ready on load.'
    );
  };

  /**
   * Assert the integration being tested loads.
   *
   * @param {Integration} integration
   * @param {Function} done
   */

  analytics.load = function(integration, done){
    analytics.assert(!integration.loaded(), 'Expected `integration.loaded()` to be false before loading.');
    analytics.once('ready', function(){
      analytics.assert(integration.loaded(), 'Expected `integration.loaded()` to be true after loading.');
      done();
    });
    analytics.initialize();
    analytics.page({}, { Marketo: true });
  };

  /**
   * Assert a script, image, or iframe was loaded.
   *
   * @param {String} str DOM template
   */
  
  analytics.loaded = function(integration, str){
    if ('string' == typeof integration) {
      str = integration;
      integration = this.integration();
    }

    var tags = [];

    assert(
      ~indexOf(this.spies, integration.load),
      'You must call `.spy(integration, \'load\')` prior to calling `.loaded()`.'
    );

    // collect all Image or HTMLElement objects
    // in an array of stringified elements, for human-readable assertions.
    each(integration.load.returns, function(el){
      var tag = {};
      if (el instanceof HTMLImageElement) {
        tag.type = 'img';
        tag.attrs = { src: el.src };
      } else if (is.element(el)) {
        tag.type = el.tagName.toLowerCase();
        tag.attrs = attributes(el);
        switch (tag.type) {
          case 'script':
            // don't care about these properties.
            delete tag.attrs.type;
            delete tag.attrs.async;
            delete tag.attrs.defer;
            break;
        }
      }
      if (tag.type) tags.push(stringify(tag.type, tag.attrs));
    });

    // normalize formatting
    var tag = objectify(str);
    var expected = stringify(tag.type, tag.attrs);

    if (!tags.length) {
      assert(false, fmt('No tags were returned.\nExpected %s.', expected));
    } else {
      // show the closest match
      assert(
        indexOf(tags, expected) !== -1,
        fmt('\nExpected %s.\nFound %s', expected, tags.join('\n'))
      );
    }
  };

  /**
   * Get current integration.
   *
   * @return {Integration}
   */
  
  analytics.integration = function(){
    for (var name in this._integrations) return this._integrations[name];
  };

  /**
   * Assert a `value` is truthy.
   *
   * @param {Mixed} value
   * @return {Tester}
   */

  analytics.assert = assert;

  /**
   * Expose all of the methods on `assert`.
   *
   * @param {Mixed} args...
   * @return {Tester}
   */

  each(keys(assert), function(key){
    analytics[key] = function(){
      var args = [].slice.call(arguments);
      assert[key].apply(assert, args);
      return this;
    };
  });

  /**
   * Create a DOM node string.
   */

  function stringify(name, attrs) {
    var str = [];
    str.push('<' + name);
    each(attrs, function(key, val){
      str.push(' ' + key + '="' + val + '"');
    });
    str.push('>');
    // block
    if ('img' !== name) str.push('</' + name + '>');
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
    each(node.attributes, function(attr){
      obj[attr.name] = attr.value;
    });
    return obj;
  }

  /**
   * Given a string, give back DOM attributes.
   *
   * @param {String} str
   * @return {Object}
   */

  function objectify(str) {
    // replace `src` with `data-src` to prevent image loading
    str = str.replace(' src="', ' data-src="');
    
    var el = domify(str);
    var attrs = {};
    
    each(el.attributes, function(attr){
      // then replace it back
      var name = 'data-src' == attr.name ? 'src' : attr.name;
      attrs[name] = attr.value;
    });
    
    return {
      type: el.tagName.toLowerCase(),
      attrs: attrs
    };
  }
}