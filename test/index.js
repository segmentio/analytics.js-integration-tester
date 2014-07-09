
var createIntegration = require('analytics.js-integration');
var Analytics = require('analytics.js').constructor;
var assert = require('assert');
var domify = require('domify');
var facade = require('facade');
var tester = require('../');

describe('integration-tester', function(){
  var noop = function(){};
  var analytics;
  var integration;
  var Integration = createIntegration('Name')
    .global('global')
    .option('option', 'value')
    .option('object', {})
    .mapping('map')
    .readyOnLoad();

  beforeEach(function(){
    analytics = new Analytics;
    integration = new Integration;
    analytics.use(tester);
    analytics.add(integration);
  });

  it('should compare two integrations', function(){
    analytics.compare(Integration, createIntegration('Name')
      .global('global')
      .option('option', 'value')
      .option('object', {})
      .mapping('map')
      .readyOnLoad());
  });

  describe('#spy', function(){
    it('should spy on a method of a host object', function(){
      var obj = { method: noop };
      analytics.spy(obj, 'method');
      assert.notEqual(obj.method, noop);
    });
  });

  describe('#stub', function(){
    it('should stub a method of a host object', function(){
      var obj = { method: noop };
      analytics.stub(obj, 'method');
      assert.notEqual(obj.method, noop);
      assert.equal(typeof obj.method, 'function');
    });

    it('should restore a stubbed method', function(){
      var obj = { method: noop };
      analytics.stub(obj, 'method');
      analytics.restore(obj, 'method');
      assert.deepEqual(obj.method, noop);
    });
  });

  describe('#called', function(){
    it('should throw if the spy does not exist', function(){
      assert.throws(function(){
        analytics.called(noop);
      });
    });

    it('should throw if the spy was not called', function(){
      var obj = { method: noop };
      analytics.spy(obj, 'method');
      assert.throws(function(){
        analytics.called(obj.method);
      });
    });

    it('should not throw if the spy was called', function(){
      var obj = { method: noop };
      analytics.spy(obj, 'method');
      obj.method();
      analytics.called(obj.method);
    });

    it('should throw if the spy was not called with the right arguments', function(){
      var obj = { method: noop };
      analytics.spy(obj, 'method');
      obj.method('a');
      assert.throws(function(){
        analytics.called(obj.method, 'b');
      });
    });

    it('should not throw if the spy was called with the right arguments', function(){
      var obj = { method: noop };
      analytics.spy(obj, 'method');
      obj.method('a');
      analytics.called(obj.method, 'a');
    });
  });

  describe('#didNotCall', function(){
    it('should throw if the spy does not exist', function(){
      assert.throws(function(){
        analytics.didNotCall(noop);
      });
    });

    it('should throw if the spy was called', function(){
      var obj = { method: noop };
      analytics.spy(obj, 'method');
      obj.method();
      assert.throws(function(){
        analytics.didNotCall(obj.method);
      });
    });

    it('should not throw is the spy was not called', function(){
      var obj = { method: noop };
      analytics.spy(obj, 'method');
      analytics.didNotCall(obj.method);
    });

    it('should throw if the spy was called with the right arguments', function(){
      var obj = { method: noop };
      analytics.spy(obj, 'method');
      obj.method('a');
      assert.throws(function(){
        analytics.didNotCall(obj.method, 'a');
      });
    });

    it('should not throw if the spy was called with the wrong arguments', function(){
      var obj = { method: noop };
      analytics.spy(obj, 'method');
      obj.method('a');
      analytics.didNotCall(obj.method, 'b');
    });
  });

  describe('#returned', function(){
    it('should throw if the spy does not exist', function(){
      assert.throws(function(){
        analytics.returned(noop);
      });
    });

    it('should throw if the spy did not return the value', function(){
      var obj = { method: noop };
      analytics.spy(obj, 'method');
      obj.method();
      assert.throws(function(){
        analytics.returned(obj.method, 'a');
      });
    });

    it('should not throw if the spy returned the value', function(){
      var obj = { method: function(){ return 1; }};
      analytics.spy(obj, 'method');
      obj.method();
      analytics.returned(obj.method, 1);
    });
  });

  describe('#didNotReturn', function(){
    it('should throw if the spy does not exist', function(){
      assert.throws(function(){
        analytics.didNotReturn(noop);
      });
    });

    it('should throw if the spy returned the value', function(){
      var obj = { method: function(){ return 1; }};
      analytics.spy(obj, 'method');
      obj.method();
      assert.throws(function(){
        analytics.didNotReturn(obj.method, 1);
      });
    });

    it('should not throw if the spy did not return the value', function(){
      var obj = { method: noop };
      analytics.spy(obj, 'method');
      obj.method();
      analytics.didNotReturn(obj.method, 'a');
    });
  });

  describe('#assert', function(){
    it('should throw with a falsey value', function(){
      assert.throws(function(){
        analytics.assert(false);
      });
    });

    it('should not throw with a truthy value', function(){
      analytics.assert(true);
    });
  });

  describe('#equal', function(){
    it('should throw if the values are not equal', function(){
      assert.throws(function(){
        analytics.equal('a', 'b');
      });
    });

    it('should not throw if the values are equal', function(){
      analytics.equal('a', 'a');
    });
  });

  describe('#deepEqual', function(){
    it('should throw if the values are not deep equal', function(){
      assert.throws(function(){
        analytics.deepEqual({}, { baz: true });
      });
    });

    it('should not throw if the values are deep equal', function(){
      analytics.deepEqual({}, {});
    });
  });

  describe('#loaded', function(){
    describe('img tag', function(){
      it('should throw if it does not find an img tag', function(done){
        var str = '<img src="http://example.com/example.png"/>';
        analytics.loaded(str, function(err){
          assert(err);
          done();
        });
      });

      it('should not throw if it does find an img tag', function(done){
        var str = '<img src="http://example.com/example.png"/>';
        document.body.appendChild(domify(str));
        analytics.loaded(str, done);
      });
    });

    describe('script tag', function(){
      it('should throw if it does not find a script tag', function(done){
        var str = '<script src="http://example.com/example.js"></script>';
        analytics.loaded(str, function(err){
          assert(err);
          done();
        });
      });

      it('should not throw if it does find a script tag', function(done){
        var str = '<script src="http://example.com/example.js"></script>';
        document.body.appendChild(domify(str));
        analytics.loaded(str, done);
      });
    });

    it('should support many', function(done){
      var a = '<img src="http://example.com/example2.png"/>';
      var b = '<script src="http://example.com/example2.js"></script>';
      document.body.appendChild(domify(a));
      document.body.appendChild(domify(b));
      analytics.loaded(a, b, done);
    });
  });
});