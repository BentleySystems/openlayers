goog.provide('ol.geom.Point');

goog.require('goog.asserts');
goog.require('ol.Extent');
goog.require('ol.geom.Coordinate');
goog.require('ol.geom.Geometry');
goog.require('ol.geom.GeometryType');



/**
 * @constructor
 * @extends {ol.geom.Geometry}
 * @param {ol.geom.Coordinate} coordinates Coordinates array (e.g. [x, y]).
 */
ol.geom.Point = function(coordinates) {

  goog.base(this);

  /**
   * @type {Array}
   */
  this.coordinates = coordinates;

  /**
   * @type {number}
   */
  this.dimension = coordinates.length;
  goog.asserts.assert(this.dimension >= 2);

  /**
   * @type {ol.Extent}
   * @private
   */
  this.bounds_ = null;

};
goog.inherits(ol.geom.Point, ol.geom.Geometry);


/**
 * @inheritDoc
 */
ol.geom.Point.prototype.getBounds = function() {
  if (goog.isNull(this.bounds_)) {
    var x = this.coordinates[0],
        y = this.coordinates[1];
    this.bounds_ = new ol.Extent(x, y, x, y);
  }
  return this.bounds_;
};


/**
 * @inheritDoc
 */
ol.geom.Point.prototype.getType = function() {
  return ol.geom.GeometryType.POINT;
};
