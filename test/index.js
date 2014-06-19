
describe('integration-tester', function(){

  var assert = require('assert');
  var analytics = require('analytics.js');
  var createIntegration = require('analytics.js-integration');
  var facade = require('facade');
  var noop = function(){};
  var spy = require('spy');
  var tester = require('../lib');

  var Alias = facade.Alias;
  var Group = facade.Group;
  var Identify = facade.Identify;
  var Page = facade.Page;
  var Track = facade.Track;

  var integration;
  var test;
  var Integration = createIntegration('Name')
    .global('global')
    .option('option', 'value')
    .option('object', {})
    .mapping('map')
    .readyOnLoad();

  beforeEach(function(){
    integration = new Integration;
    test = tester(integration, analytics);
  });

  it('should work', function () {
    test
      .global('global')
      .option('option', 'value')
      .option('object', {})
      .mapping('map')
      .readyOnLoad();
  });

  it('should not allow overriding of private methods', function(){
    integration.queue = function(){};
    assert.throws(function(){
      tester(integration);
    });
  });

  it('should expose facade methods as .types', function(){
    assert(tester.types);
    assert(tester.types.identify);
    assert(tester.types.group);
    assert(tester.types.track);
    assert(tester.types.alias);
    assert(tester.types.page);
  });

  describe('#name', function(){
    it('should throw if the name does not match', function(){
      assert.throws(function(){
        test.name('Not');
      });
    });

    it('should not throw if the name matches', function(){
      test.name('Name');
    });
  });

  describe('#global', function(){
    it('should throw if the global does not exist', function(){
      assert.throws(function(){
        test.global('not');
      });
    });

    it('should not throw if the global exists', function(){
      test.global('global');
    });
  });

  describe('#option', function(){
    it('should throw if the option does not exist', function(){
      assert.throws(function(){
        test.option('not', false);
      });
    });

    it('should throw if the option\'s default does not match', function(){
      assert.throws(function(){
        test.option('option', true);
      });
    });

    it('should not throw if the option\'s default matches', function(){
      test.option('option', 'value');
    });
  });

  describe('#mapping', function(){
    it('should throw if the mapping does not exist', function(){
      assert.throws(function(){
        test.mapping('not');
      });
    });

    it('shuold not throw if the mapping exists', function(){
      test.mapping('map');
    });
  });

  describe('#spy', function(){
    it('should spy on a method of a host object', function(){
      var obj = { method: noop };
      test.spy(obj, 'method');
      assert.notEqual(obj.method, noop);
    });
  });

  describe('#stub', function(){
    it('should stub a method of a host object', function(){
      var obj = { method: noop };
      test.stub(obj, 'method');
      assert.notEqual(obj.method, noop);
      assert.equal(typeof obj.method, 'function');
    });

    it('should restore a stubbed method', function(){
      var obj = { method: noop };
      test.stub(obj, 'method');
      test.restore(obj, 'method');
      assert.deepEqual(obj.method, noop);
    });
  });

  describe('#called', function(){
    it('should throw if the spy does not exist', function(){
      assert.throws(function(){
        test.called(noop);
      });
    });

    it('should throw if the spy was not called', function(){
      var obj = { method: noop };
      test.spy(obj, 'method');
      assert.throws(function(){
        test.called(obj.method);
      });
    });

    it('should not throw if the spy was called', function(){
      var obj = { method: noop };
      test.spy(obj, 'method');
      obj.method();
      test.called(obj.method);
    });

    it('should throw if the spy was not called with the right arguments', function(){
      var obj = { method: noop };
      test.spy(obj, 'method');
      obj.method('a');
      assert.throws(function(){
        test.called(obj.method, 'b');
      });
    });

    it('should not throw if the spy was called with the right arguments', function(){
      var obj = { method: noop };
      test.spy(obj, 'method');
      obj.method('a');
      test.called(obj.method, 'a');
    });
  });

  describe('#didNotCall', function(){
    it('should throw if the spy does not exist', function(){
      assert.throws(function(){
        test.didNotCall(noop);
      });
    });

    it('should throw if the spy was called', function(){
      var obj = { method: noop };
      test.spy(obj, 'method');
      obj.method();
      assert.throws(function(){
        test.didNotCall(obj.method);
      });
    });

    it('should not throw is the spy was not called', function(){
      var obj = { method: noop };
      test.spy(obj, 'method');
      test.didNotCall(obj.method);
    });

    it('should throw if the spy was called with the right arguments', function(){
      var obj = { method: noop };
      test.spy(obj, 'method');
      obj.method('a');
      assert.throws(function(){
        test.didNotCall(obj.method, 'a');
      });
    });

    it('should not throw if the spy was called with the wrong arguments', function(){
      var obj = { method: noop };
      test.spy(obj, 'method');
      obj.method('a');
      test.didNotCall(obj.method, 'b');
    });
  });

  describe('#returned', function(){
    it('should throw if the spy does not exist', function(){
      assert.throws(function(){
        test.returned(noop);
      });
    });

    it('should throw if the spy did not return the value', function(){
      var obj = { method: noop };
      test.spy(obj, 'method');
      obj.method();
      assert.throws(function(){
        test.returned(obj.method, 'a');
      });
    });

    it('should not throw if the spy returned the value', function(){
      var obj = { method: function(){ return 1; }};
      test.spy(obj, 'method');
      obj.method();
      test.returned(obj.method, 1);
    });
  });

  describe('#didNotReturn', function(){
    it('should throw if the spy does not exist', function(){
      assert.throws(function(){
        test.didNotReturn(noop);
      });
    });

    it('should throw if the spy returned the value', function(){
      var obj = { method: function(){ return 1; }};
      test.spy(obj, 'method');
      obj.method();
      assert.throws(function(){
        test.didNotReturn(obj.method, 1);
      });
    });

    it('should not throw if the spy did not return the value', function(){
      var obj = { method: noop };
      test.spy(obj, 'method');
      obj.method();
      test.didNotReturn(obj.method, 'a');
    });
  });

  describe('#initialize', function(){
    it('should automatically call #initialize if it assumesPageview', function(){
      integration._assumesPageview = true;
      integration.initialize = spy();
      tester(integration);
      assert(integration.initialize.called);
    });

    it('should call #initialize on the integration', function(){
      integration.initialize = spy();
      tester(integration).initialize();
      assert(integration.initialize.called);
    });
  });

  describe('#set', function(){
    it('should set an option on an integration', function(){
      test.set('option', 'a');
      assert.equal('a', integration.options.option);
    });
  });

  describe('#store', function(){
    it('should identify a user', function(){
      test.store('user', 'id', { traits: true });
      assert.equal('id', test.analytics.user().id());
      assert.equal(true, test.analytics.user().traits().traits);
    });

    it('should identify a group', function(){
      test.store('group', 'id', { traits: true });
      assert.equal('id', test.analytics.group().id());
      assert.equal(true, test.analytics.group().traits().traits);
    });
  });

  describe('#group', function(){
    it('should call #group on the integration with a Group facade', function(){
      integration.group = spy();
      test.group('id', { trait: true });
      var group = integration.group.args[0][0];
      assert(group instanceof Group);
      assert('id' == group.groupId());
      assert(true == group.traits().trait);
    });
  });

  describe('#alias', function(){
    it('should call #alias on the integration with an Alias facade', function(){
      integration.alias = spy();
      test.alias('id');
      var alias = integration.alias.args[0][0];
      assert(alias instanceof Alias);
      assert('id' == alias.userId());
    });
  });

  describe('#identify', function(){
    it('should call #identify on the integration with an Identify facade', function(){
      integration.identify = spy();
      test.identify('id', { trait: true });
      var identify = integration.identify.args[0][0];
      assert(identify instanceof Identify);
      assert('id' == identify.userId());
      assert(true == identify.traits().trait);
    });
  });

  describe('#page', function(){
    it('should call #page on the integration with a Page facade', function(){
      integration.page = spy();
      test.page('category', 'name', { property: true });
      var page = integration.page.args[0][0];
      assert(page instanceof Page);
      assert('name' == page.name());
      assert('category' == page.category());
      assert(true == page.properties().property);
    });
  });

  describe('#track', function(){
    it('should call #track on the integration with a Track facade', function(){
      integration.track = spy();
      test.track('event', { property: true });
      var track = integration.track.args[0][0];
      assert(track instanceof Track);
      assert('event' == track.event());
      assert(true == track.properties().property);
    });
  });

  describe('#assert', function(){
    it('should throw with a falsey value', function(){
      assert.throws(function(){
        test.assert(false);
      });
    });

    it('should not throw with a truthy value', function(){
      test.assert(true);
    });
  });

  describe('#equal', function(){
    it('should throw if the values are not equal', function(){
      assert.throws(function(){
        test.equal('a', 'b');
      });
    });

    it('should not throw if the values are equal', function(){
      test.equal('a', 'a');
    });
  });

  describe('#deepEqual', function(){
    it('should throw if the values are not deep equal', function(){
      assert.throws(function(){
        test.deepEqual({}, { baz: true });
      });
    });

    it('should not throw if the values are deep equal', function(){
      test.deepEqual({}, {});
    });
  });
});
