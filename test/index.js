
describe('integration-tester', function () {

  var createIntegration = require('integration');
  var tester = require('integration-tester');
  var Assertion = tester.Assertion;
  var assert = require('assert');
  var facade = require('facade');
  var Identify = facade.Identify;
  var Track = facade.Track;
  var Group = facade.Group;
  var Alias = facade.Alias;
  var Page = facade.Page;
  var sinon = require('sinon');

  var Integration = createIntegration('Name')
    .global('global')
    .option('option', 'value')
    .option('object', {})
    .assumesPageview()
    .readyOnLoad();

  it('should work', function () {
    var integration = new Integration();
    tester(integration)
      .global('global')
      .option('option', 'value')
      .option('object', {})
      .assumesPageview()
      .readyOnLoad();
  });

  describe('.identify(id, traits)', function(){
    var integration;

    beforeEach(function(){
      if (integration) integration.identify.reset();
      integration = new Integration;
      integration.identify = sinon.spy();
    })

    it('should call #identify on integration with Identify', function(){
      tester(integration).identify('my id', { trait: true });
      integration.identify.calledWithNew(Identify);
    })

    it('should call integration with correct Identify', function(){
      tester(integration).identify('baz', { trait: true });
      var identify = integration.identify.args[0][0];
      tester(identify instanceof Identify);
      tester('baz' == identify.userId());
      tester(true == identify.traits().trait);
    })
  })

  describe('.group(id, traits)', function(){
    var integration;

    beforeEach(function(){
      if (integration) integration.group.reset();
      integration = new Integration;
      integration.group = sinon.spy();
    })

    it('should call #group on integration with Group', function(){
      tester(integration).group('my id', { trait: true });
      integration.group.calledWithNew(Identify);
    })

    it('should call integration with correct Identify', function(){
      tester(integration).group('baz', { prop: true });
      var group = integration.group.args[0][0];
      tester(group instanceof Group);
      tester('baz' == group.groupId());
      tester(true == group.properties().prop);
    })
  })

  describe('.track(event, props)', function(){
    var integration;

    beforeEach(function(){
      if (integration) integration.track.reset();
      integration = new Integration;
      integration.track = sinon.spy();
    })

    it('should call #track on integration with Track', function(){
      tester(integration).track('event', { prop: true });
      integration.track.calledWithNew(Track);
    })

    it('should call integration with correct Identify', function(){
      tester(integration).track('event', { prop: true });
      var track = integration.track.args[0][0];
      tester(track instanceof Track);
      tester('event' == track.event());
      tester(true == track.properties().prop);
    })
  })


  describe('.alias(from, to)', function(){
    var integration;

    beforeEach(function(){
      if (integration) integration.alias.reset();
      integration = new Integration;
      integration.alias = sinon.spy();
    })

    it('should call #alias on integration with Alias', function(){
      tester(integration).alias('from', 'to');
      integration.alias.calledWithNew(Alias);
    })

    it('should call integration with correct Alias', function(){
      tester(integration).alias('from', 'to');
      var alias = integration.alias.args[0][0];
      tester(alias instanceof Alias);
      tester('from' == alias.from());
      tester('to' == alias.to());
    })
  })


  describe('.page(category, name, properties)', function(){
    var integration;

    beforeEach(function(){
      if (integration) integration.page.reset();
      integration = new Integration;
      integration.page = sinon.spy();
    })

    it('should call #page on integration with Page', function(){
      tester(integration).page();
      integration.page.calledWithNew(Page);
    })

    it('should call integration with correct Page', function(){
      tester(integration).page('category', 'name', {});
      var page = integration.page.args[0][0];
      tester(page instanceof Page);
      tester('category' == page.category());
      tester('name' == page.name());
      tester('object' == typeof page.properties());
    })
  })

  describe('Assertion', function(){
    var assertion;

    beforeEach(function(){
      assertion = new Assertion;
    })

    describe('.called()', function(){
      it('should throw if spy wasnt called', function(){
        var spy = sinon.spy(function(){});

        try {
          assertion.called(spy);
          assert(false);
        } catch (e) {
          assert(~e.message.indexOf('"proxy"'));
          assert(~e.message.indexOf('Expected'));
        }
      })

      it('should save spy and return assertion', function(){
        var proxy = sinon.spy(function(){});
        proxy();
        assert(proxy == assertion.called(proxy).spy)
      })
    })

    describe('.with()', function(){
      it('should throw if theres no spy', function(){
        try {
          assertion.with();
          assert(false);
        } catch (e) {
          assert(~e.message.indexOf('.called(spy)'));
        }
      })

      it('should throw if provided arguments are incorrect', function(){
        var proxy = sinon.spy(function(){});
        proxy('foo');

        try {
          assertion
          .called(proxy)
          .with('baz');
          assert(false);
        } catch (e) {
          assert(~e.message.indexOf('"baz"'));
          assert(~e.message.indexOf('"foo"'));
        }
      })

      it('should not throw and delete the spy if assertion is correct', function(){
        var proxy = sinon.spy(function(){});
        proxy('baz');
        assertion.called(proxy).with('baz');
        assert(!assertion.hasOwnProperty('spy'));
      })
    })

    describe('.changed()', function(){
      it('should throw if from isnt eql to to', function(){
        try {
          assertion.changed({}, { baz: true });
          assert(false);
        } catch (e) {
          assert(~e.message.indexOf('Expected'));
          assert(~e.message.indexOf('to'));
        }
      })

      it('should save from', function(){
        var obj = {};
        assertion.changed(obj);
        assert(obj == assertion.from);
      })

      it('should return assertion and delete .from', function(){
        assertion.changed({ baz: true}, { baz: true });
        assert(!assertion.hasOwnProperty('from'));
      })
    })

    describe('.to()', function(){
      it('should throw if theres no from', function(){
        try {
          assertion.to({});
          assert(false);
        } catch (e) {
          assert(~e.message.indexOf('.changed('));
        }
      })

      it('should work with .changed()', function(){
        var obj = {};
        assertion
        .changed(obj)
        .to(obj);
      })
    })
  })



});
