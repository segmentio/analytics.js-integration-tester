
describe('integration-tester', function () {

  var createIntegration = require('integration');
  var assert = require('integration-tester');

  var Integration = createIntegration('Name')
    .global('global')
    .option('option', 'value')
    .option('object', {})
    .assumesPageview()
    .readyOnLoad();

  it('should work', function () {
    var integration = new Integration();
    assert(integration)
      .global('global')
      .option('option', 'value')
      .option('object', {})
      .assumesPageview()
      .readyOnLoad();
  });

});