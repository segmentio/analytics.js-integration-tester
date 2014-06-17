
# analytics.js-integration-tester

  A helper to easily test an [Analytics.js](https://github.com/segmentio/analytics.js) [integration](https://github.com/segmentio/analytics.js-integration).

  It works similarly to how [`supertest`](https://github.com/visionmedia/supertest) works for [Superagent](https://github.com/visionmedia/superagent). It basically wraps an existing `integration` instance in helpers methods that do the actual asserting logic for you under the covers, so that your tests are cleaner to write.

## Installation

    $ component install segmentio/analytics.js-integration-tester

## Example

```js
var assert = require('integration-tester');

assert(integration)
  .name('Custom')
  .global('_custom')
  .readyOnInitialize()
  .option('apiKey', '')
  .option('track', false);
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

### initialize()

  Call `initialize` on the integration.

### loads(callback)

  Assert that the integration `load` method can load the library, and that `loaded` properly checks for the libraries existence, then `callback(err)`.

### <method>(args...)
 
  Call one of the core analytics methods on the integration with `args...`. The methods include: `alias`, `identify`, `group`, `page`, and `track`.
 
## License

  MIT
