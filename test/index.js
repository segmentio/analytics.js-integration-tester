
describe('integration-tester', function(){

  var createIntegration = require('analytics.js-integration');
  var tester = require('../lib');
  var Assertion = tester.Assertion;
  var assert = require('assert');
  var facade = require('facade');
  var Identify = facade.Identify;
  var spy = require('spy');
  var Track = facade.Track;
  var Group = facade.Group;
  var Alias = facade.Alias;
  var Page = facade.Page;

  var Integration = createIntegration('Name')
    .global('global')
    .option('option', 'value')
    .option('object', {})
    .mapping('map')
    .assumesPageview()
    .readyOnLoad();

  it('should work', function () {
    var integration = new Integration();
    tester(integration)
      .global('global')
      .option('option', 'value')
      .option('object', {})
      .mapping('map')
      .assumesPageview()
      .readyOnLoad();
  });

  it('should not allow overriding of private methods', function(){
    var integration = new Integration();
    integration.queue = function(){};
    var error;
    try {
      tester(integration)
    } catch (err) {
      error = err;
    }
    assert(error);
  });

  it('should expose facade\'s methods on .types', function(){
    assert(tester.types);
    assert(tester.types.identify);
    assert(tester.types.group);
    assert(tester.types.track);
    assert(tester.types.alias);
    assert(tester.types.page);
  })

  describe('.initialize()', function(){
    it('should return the value', function(){
      Integration.prototype.initialize = Function('return 1');
      var integration = new Integration;
      integration.initialize(); // noop
      var assertion = tester(integration).initialize();
      assert(1 == assertion.ret);
    })
  })

  describe('.identify(id, traits)', function(){
    var integration;

    beforeEach(function(){
      if (integration) integration.identify.reset();
      integration = new Integration;
      integration.identify = spy();
    })

    it('should call #identify on integration with Identify', function(){
      tester(integration).identify('my id', { trait: true });
      assert(integration.identify.args[0][0] instanceof Identify);
    })

    it('should call integration with correct Identify', function(){
      tester(integration).identify('baz', { trait: true });
      var identify = integration.identify.args[0][0];
      assert(identify instanceof Identify);
      assert('baz' == identify.userId());
      assert(true == identify.traits().trait);
    })

    it('should keep the returned value on `.ret`', function(){
      integration.identify = Function('return 1');
      var assertion = tester(integration).identify('baz', { trait: true });
      assert(1 == assertion.ret);
    })
  })

  describe('.group(id, traits)', function(){
    var integration;

    beforeEach(function(){
      if (integration) integration.group.reset();
      integration = new Integration;
      integration.group = spy();
    })

    it('should call #group on integration with Group', function(){
      tester(integration).group('my id', { trait: true });
      assert(integration.group.args[0][0] instanceof Group);
    })

    it('should call integration with correct Identify', function(){
      tester(integration).group('baz', { prop: true });
      var group = integration.group.args[0][0];
      assert(group instanceof Group);
      assert('baz' == group.groupId());
      assert(true == group.properties().prop);
    })

    it('should keep the returned value on `.ret`', function(){
      integration.group = Function('return 1');
      var assertion = tester(integration).group('baz', { trait: true });
      assert(1 == assertion.ret);
    })
  })

  describe('.track(event, props)', function(){
    var integration;

    beforeEach(function(){
      if (integration) integration.track.reset();
      integration = new Integration;
      integration.track = spy();
    })

    it('should call #track on integration with Track', function(){
      tester(integration).track('event', { prop: true });
      assert(integration.track.args[0][0] instanceof Track);
    })

    it('should call integration with correct Identify', function(){
      tester(integration).track('event', { prop: true });
      var track = integration.track.args[0][0];
      assert(track instanceof Track);
      assert('event' == track.event());
      assert(true == track.properties().prop);
    })

    it('should keep the returned value on `.ret`', function(){
      integration.track = Function('return 1');
      var assertion = tester(integration).track('event', { prop: true });
      assert(1 == assertion.ret);
    })
  })


  describe('.alias(from, to)', function(){
    var integration;

    beforeEach(function(){
      if (integration) integration.alias.reset();
      integration = new Integration;
      integration.alias = spy();
    })

    it('should call #alias on integration with Alias', function(){
      tester(integration).alias('from', 'to');
      assert(integration.alias.args[0][0] instanceof Alias);
    })

    it('should call integration with correct Alias', function(){
      tester(integration).alias('from', 'to');
      var alias = integration.alias.args[0][0];
      assert(alias instanceof Alias);
      assert('from' == alias.to());
      assert('to' == alias.from());
    })

    it('should keep the returned value on `.ret`', function(){
      integration.alias = Function('return 1');
      var assertion = tester(integration).alias('1', '2');
      assert(1 == assertion.ret);
    })
  })


  describe('.page(category, name, properties)', function(){
    var integration;

    beforeEach(function(){
      if (integration) integration.page.reset();
      integration = new Integration;
      integration.page = spy();
    })

    it('should call #page on integration with Page', function(){
      tester(integration).page();
      assert(integration.page.args[0][0] instanceof Page);
    })

    it('should call integration with correct Page', function(){
      tester(integration).page('category', 'name', {});
      var page = integration.page.args[0][0];
      assert(page instanceof Page);
      assert('category' == page.category());
      assert('name' == page.name());
      assert('object' == typeof page.properties());
    })

    it('should keep the returned value on `.ret`', function(){
      integration.page = Function('return 1');
      var assertion = tester(integration).page();
      assert(1 == assertion.ret);
    })
  })

  describe('.initialize()', function(){
    var integration;

    beforeEach(function(){
      integration = new Integration;
      integration.initialize = spy();
    })

    it('should call initialize', function(){
      tester(integration).initialize();
      assert(integration.initialize.called);
    })
  })

  describe('.deepEqual()', function(){
    it('should throw if the values are not deep equal', function(){
      try {
        var integration = new Integration;
        tester(integration).deepEqual({}, { baz: true });
        assert(false);
      } catch (e) {
        assert(e);
      }
    })

    it('should not throw if the values are deep equal', function(){
      var integration = new Integration;
      tester(integration).deepEqual({}, {});
    })
  })

  describe('Assertion', function(){
    var assertion;

    beforeEach(function(){
      assertion = new Assertion;
    })

    describe('.called()', function(){
      it('should throw if spy wasnt called', function(){
        var s = spy(function(){});

        try {
          assertion.called(s);
          assert(false);
        } catch (e) {
          assert(~e.message.indexOf('"spy"'));
          assert(~e.message.indexOf('Expected'));
        }
      })

      it('should save spy and return assertion', function(){
        var proxy = spy(function(){});
        proxy();
        assert(proxy == assertion.called(proxy).spy)
      })
    })

    describe('.args()', function(){
      it('should throw if theres no spy', function(){
        try {
          assertion.args();
          assert(false);
        } catch (e) {
          assert(~e.message.indexOf('.called(spy)'));
        }
      })

      it('should throw if provided arguments are incorrect', function(){
        var proxy = spy(function(){});
        proxy('foo');

        try {
          assertion
          .called(proxy)
          .args('baz');
          assert(false);
        } catch (e) {
          assert(~e.message.indexOf('"baz"'));
          assert(~e.message.indexOf('"foo"'));
        }
      })

      it('should not throw and delete the spy if assertion is correct', function(){
        var proxy = spy(function(){});
        proxy('baz');
        var ret = assertion.called(proxy).args('baz');
        assert(!assertion.hasOwnProperty('spy'));
        assert(ret == assertion);
      })
    })
  })

});
