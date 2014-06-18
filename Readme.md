
# analytics.js-integration-tester

  A helper to easily test an [Analytics.js](https://github.com/segmentio/analytics.js) [integration](https://github.com/segmentio/analytics.js-integration).

  It works similarly to how [`supertest`](https://github.com/visionmedia/supertest) works for [Superagent](https://github.com/visionmedia/superagent). It basically wraps an existing `integration` instance in helpers methods that do the actual asserting logic for you under the covers, so that your tests are cleaner to write.

## Installation

    $ component install segmentio/analytics.js-integration-tester

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
var assert = require('integration-tester');
var Integration = require('./integration');
var integration = new Integration();

assert(integration)
  .name('Custom')
  .readyOnInitialize()
  .global('_custom')
  .option('apiKey', '')
  .option('track', false);
```

  You can also use the tracking and spying methods to quickly test cases:

```js
assert(integration)
  .spy(window, '_custom')
  .track('Event', { property: true })
  .called(window._custom, 'Event', { property: true });
```

## API

### name(name)

  Assert that the integration's name is `string`.

### option(key, value)

  Assert that the integration has an option `key` with a default `value`.

### mapping(key)

  Assert that the integration has a mapping option named `key`.

### global(key)

  Assert that the integration has a global `key`.

### assumesPageview()

  Assert that the integration assumes a pageview.

### readyOnInitialize()

  Assert that the integration is ready on initialize.

### readyOnLoad()

  Assert that the integration is ready on load.

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

### set(option, value)

  Set an `option` on an integration to `value`.

### load(callback)

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
 
## License

  MIT
