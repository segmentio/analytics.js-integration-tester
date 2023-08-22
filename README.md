# analytics.js-integration-tester

[![CircleCI](https://circleci.com/gh/segmentio/analytics.js-integration-tester.svg?style=shield&circle-token=0ac5c09784c18d17e17c2e522c880e1f5d971f1d)](https://circleci.com/gh/segmentio/analytics.js-integration-tester)
[![Codecov](https://img.shields.io/codecov/c/github/segmentio/analytics.js-integration-tester/master.svg?maxAge=2592000)](https://codecov.io/gh/segmentio/analytics.js-integration-tester)

> **Note**  
> Segment has paused maintenance on this project, but may return it to an active status in the future. Issues and pull requests from external contributors are not being considered, although internal contributions may appear from time to time. The project remains available under its open source license for anyone to use.

An plugin to easily test an [Analytics.js](https://github.com/segmentio/analytics.js) [integration](https://github.com/segmentio/analytics.js-integration).

## Installation

```sh
$ npm install @segment/analytics.js-integration-tester
```

## Example

Imagine you had an [integration](https://github.com/segmentio/analytics.js-integration) that looked like this:

```js
module.exports = createIntegration('Custom')
  .readyOnInitialize()
  .global('_custom')
  .option('apiKey', '')
  .option('track', false);
```

You can easily assert that all of those properties are there with a familiar API, like so:

```js
var Analytics = require('@segment/analytics.js-core').constructor;
var tester = require('@segment/analytics.js-integration-tester');
var plugin = require('./integration');
var Custom = plugin.Integration;
var analytics = new Analytics();
var custom = new Custom;
analytics.use(tester);
analytics.add(custom);

var Test = createIntegration('Custom')
  .readyOnInitialize()
  .global('_custom')
  .option('apiKey', '')
  .option('track', false);

analytics.validate(Custom, Test);
```

You can also use the tracking and spying methods to quickly test cases:

```js
analytics.stub(window, '_custom');
analytics.track('Event', { property: true });
analytics.called(window._custom, 'Event', { property: true });
```

The general pattern we use is to `stub` the methods in a `beforeEach` test block, then call an `analytics` method (track, page, identify, etc.), and then check if some other internal method got called with the correct arguments using `analytics.called(method, args...)`.

## API

### compare(integration, testIntegration)

Assert that an integration is correctly defined, that it matches the `testIntegration`'s options, globals, configuration, and name.

### spy(object, method)

Spy on a `method` of a host `object`.

### stub(object, method)

Stub a `method` of a host `object`. Stubs are different than spies in that they won't pass the arguments through to the original method.

### called(spy, [args...])

Assert that a `spy` was called, optionally with `args...`.

### didNotCall(spy, [args...])

Assert that a `spy` was not called, optional with `args...`.

### returned(spy, value)

Assert that a `spy` was called and returned `value`.

### didNotReturn(spy, value)

Assert that a `spy` was called and did not return `value`.

### initialize()

Call `initialize` on the integration.

### reset()

Reset the tester. This will call `reset` on the integration, as well as restore all existing spies.

### load(integration, callback)

Assert that the integration `load` method can load the library, and that `loaded` properly checks for the libraries existence, then `callback(err)`.

### <method>(args...)

Call one of the core analytics methods on the integration with `args...`. The methods include: `alias`, `identify`, `group`, `page`, and `track`.

### assert(actual)

Assert that an `actual` value is truthy.

### equal(actual, expected)

Assert that an `actual` value is equal to an `expected` value.

### notEqual(actual, expected)

Assert that an `actual` value is not equal to an `expected` value.

### deepEqual(actual, expected)

Assert that an `actual` value is deeply equal to an `expected` value.

### notDeepEqual(actual, expected)

Assert that an `actual` value is not deeply equal to an `expected` value.

### strictEqual(actual, expected)

Assert that an `actual` value is strict (`===`) equal to an `expected` value.

### notStrictEqual(actual, expected)

Assert that an `actual` value is not strict (`===`) equal to an `expected` value.

### throws(fn)

Assert that a `fn` throws an error.

### doesNotThrow(fn)

Assert than a `fn` does not throw an error.

### waitForScripts(callback)

Waits for all script elements to finish loading before calling `callback`. Often scripts loaded onto the page will add other scripts in order to support their functionality. These scripts can reference globals that we clear after each test, causing them to fail if they load too late.

```js
afterEach(function(done) {
  analytics.waitForScripts(function() {
    myIntegration.reset();
    analytics.reset();
    done();
  });
});
```
