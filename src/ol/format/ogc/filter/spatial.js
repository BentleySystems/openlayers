goog.provide('ol.format.ogc.filter.Spatial');

goog.require('ol');
goog.require('ol.format.ogc.filter.Filter');


/**
 * @classdesc
 * Represents a spatial operator to test whether a geometry-valued property
 * relates to a given geometry.
 *
 * @constructor
 * @param {!string} tagName The XML tag name for this filter.
 * @param {!string} geometryName Geometry name to use.
 * @param {!ol.geom.Geometry} geometry Geometry.
 * @param {string=} opt_srsName SRS name. No srsName attribute will be
 *    set on geometries when this is not provided.
 * @extends {ol.format.ogc.filter.Filter}
 * @api
 */
ol.format.ogc.filter.Spatial = function(tagName, geometryName, geometry, opt_srsName) {

  ol.format.ogc.filter.Filter.call(this, tagName);

  /**
   * @public
   * @type {!string}
   */
  this.geometryName = geometryName || 'the_geom';

  /**
   * @public
   * @type {ol.geom.Geometry}
   */
  this.geometry = geometry;

  /**
   * @public
   * @type {string|undefined}
   */
  this.srsName = opt_srsName;
};
ol.inherits(ol.format.ogc.filter.Spatial, ol.format.ogc.filter.Filter);
