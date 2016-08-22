'use strict';

var each = require('@ndhoule/each');
var keys = require('@ndhoule/keys');

var TIMEOUT = 1000;

var createElement = document.createElement;
document.createElement = function() {
  var tag = createElement.apply(this, arguments);
  if (tag.tagName === 'SCRIPT') {
    watchScript(tag);
  }
  return tag;
};

var waiting = {};
var nextId = 0;

var watchCallbacks = [];

function watchScript(script) {
  var id = nextId++;
  // Hold on to a reference to the script element until it loads. Chrome seems
  // to not call the event listeners in some cases if an explicit reference is
  // not held.
  waiting[id] = script;
  var done = false;
  var cancelId = setTimeout(onLoad, TIMEOUT);

  var loadCallback = function() {
    clearTimeout(cancelId);
    onLoad();
  };

  if (script.addEventListener) {
    script.addEventListener('load', loadCallback);
  } else {
    script.attachEvent('onload', loadCallback);
  }

  function onLoad() {
    if (!done) {
      done = true;
      delete waiting[id];
      if (keys(waiting).length === 0) {
        var callbacks = watchCallbacks;
        watchCallbacks = [];
        each(function(callback) {
          callback();
        }, callbacks);
      }
    }
  }
}

module.exports = function(callback) {
  if (keys(waiting).length === 0) {
    return callback();
  }
  watchCallbacks.push(callback);
};
