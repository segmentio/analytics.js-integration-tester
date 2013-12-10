
var facade = require('facade');

/**
 * Initialize `Identify` with `id` and `traits`.
 *
 * @param {Mixed} id
 * @param {Object} traits
 * @return {Identify}
 * @api public
 */

exports.identify = function(id, traits){
  return new facade.Identify({
    traits: traits,
    userId: id
  });
};

/**
 * Initialize `Group` with `id ` and `traits`.
 *
 * TODO: remove `properties` once facade removes it.
 *
 * @param {Mixed} id
 * @param {Mixed} traits
 * @return {Group}
 * @api public
 */

exports.group = function(id, traits, options){
  return new facade.Group({
    properties: traits || {},
    options: options || {},
    traits: traits,
    groupId: id
  });
};

/**
 * Initialize `Page` with `category`, `name` and `properties`.
 *
 * @param {String} category
 * @param {String} name
 * @param {Mixed} properties
 * @return {Page}
 * @api public
 */

exports.page = function(category, name, properties, options){
  return new facade.Page({
    properties: properties || {},
    options: options || {},
    category: category,
    name: name
  });
};

/**
 * Initialize `Track` with `event` and `properties`.
 *
 * TODO: remove `traits` once facade removes it.
 *
 * @param {String} event
 * @param {Object} properties
 * @return {Track}
 * @api public
 */

exports.track = function(event, properties, options){
  return new facade.Track({
    properties: properties || {},
    options: options || {},
    traits: properties,
    event: event
  });
};

/**
 * Initialize `Alias` with `from` and `to`.
 *
 * @param {Mixed} to
 * @param {Mixed} from
 * @return {Alias}
 * @api public
 */

exports.alias = function(to, from, options){
  return new facade.Alias({
    options: options || {},
    from: from,
    to: to
  });
};
