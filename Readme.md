
# analytics.js-integration-tester

  Helper to quickly test an analytics.js integration.

## Installation

    $ component install segmentio/analytics.js-integration-tester

## Example

```js
var assert = require('integration-tester');

assert(Integration)
  .name('Custom')
  .global('_custom')
  .readyOnInitialize()
  .option('apiKey', '');
```

## API

### name(name)

  Assert that the integration's name is `string`.

### global(key)

  Assert that the integration has a global `key`.

### option(key, value)

  Assert that the integration has an option `key` with a default `value`.

### assumesPageview()

  Assert that the integration assumes a pageview.
 

### readyOnInitialize()

  Assert that the integration is ready on initialize.
 

### readyOnLoad()

  Assert that the integration is ready on load.
 
## License

  MIT
