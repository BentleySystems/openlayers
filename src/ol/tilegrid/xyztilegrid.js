goog.provide('ol.tilegrid.XYZ');

goog.require('goog.math');
goog.require('ol.Size');
goog.require('ol.TileCoord');
goog.require('ol.TileRange');
goog.require('ol.extent');
goog.require('ol.projection');
goog.require('ol.projection.EPSG3857');
goog.require('ol.tilegrid.TileGrid');



/**
 * @constructor
 * @extends {ol.tilegrid.TileGrid}
 * @param {ol.tilegrid.XYZOptions} options XYZ options.
 */
ol.tilegrid.XYZ = function(options) {

  var resolutions = new Array(options.maxZoom + 1);
  var z;
  var size = 2 * ol.projection.EPSG3857.HALF_SIZE / ol.DEFAULT_TILE_SIZE;
  for (z = 0; z <= options.maxZoom; ++z) {
    resolutions[z] = size / Math.pow(2, z);
  }

  goog.base(this, {
    minZoom: options.minZoom,
    origin: [-ol.projection.EPSG3857.HALF_SIZE,
             ol.projection.EPSG3857.HALF_SIZE],
    resolutions: resolutions,
    tileSize: new ol.Size(ol.DEFAULT_TILE_SIZE, ol.DEFAULT_TILE_SIZE)
  });

};
goog.inherits(ol.tilegrid.XYZ, ol.tilegrid.TileGrid);


/**
 * @param {{wrapX: (boolean|undefined),
 *          extent: (ol.Extent|undefined)}=} opt_options Options.
 * @return {function(ol.TileCoord, ol.Projection, ol.TileCoord=): ol.TileCoord}
 *     Tile coordinate transform.
 */
ol.tilegrid.XYZ.prototype.createTileCoordTransform = function(opt_options) {
  var options = goog.isDef(opt_options) ? opt_options : {};
  var tileGrid = this;
  var minZ = this.minZoom;
  var maxZ = this.maxZoom;
  var wrapX = goog.isDef(options.wrapX) ? options.wrapX : true;
  var extent = options.extent;
  var tmpExtent = ol.extent.createEmptyExtent();
  var tmpTileCoord = new ol.TileCoord(0, 0, 0);
  return (
      /**
       * @param {ol.TileCoord} tileCoord Tile coordinate.
       * @param {ol.Projection} projection Projection.
       * @param {ol.TileCoord=} opt_tileCoord Destination tile coordinate.
       * @return {ol.TileCoord} Tile coordinate.
       */
      function(tileCoord, projection, opt_tileCoord) {
        var z = tileCoord.z;
        if (z < minZ || maxZ < z) {
          return null;
        }
        var n = Math.pow(2, z);
        var x = tileCoord.x;
        if (wrapX) {
          x = goog.math.modulo(x, n);
        } else if (x < 0 || n <= x) {
          return null;
        }
        var y = tileCoord.y;
        if (y < -n || -1 < y) {
          return null;
        }
        if (goog.isDef(extent)) {
          tmpTileCoord.z = z;
          tmpTileCoord.x = x;
          tmpTileCoord.y = y;
          var tileExtent =
              tileGrid.getTileCoordExtent(tmpTileCoord, tmpExtent);
          if (!ol.extent.intersects(extent, tileExtent)) {
            return null;
          }
        }
        if (goog.isDef(opt_tileCoord)) {
          opt_tileCoord.z = z;
          opt_tileCoord.x = x;
          opt_tileCoord.y = -y - 1;
          return opt_tileCoord;
        } else {
          return new ol.TileCoord(z, x, -y - 1);
        }
      });
};


/**
 * @inheritDoc
 */
ol.tilegrid.XYZ.prototype.getTileCoordChildTileRange =
    function(tileCoord, opt_tileRange) {
  if (tileCoord.z < this.maxZoom) {
    return ol.TileRange.createOrUpdate(
        2 * tileCoord.x, 2 * (tileCoord.x + 1),
        2 * tileCoord.y, 2 * (tileCoord.y + 1),
        opt_tileRange);
  } else {
    return null;
  }
};


/**
 * @inheritDoc
 */
ol.tilegrid.XYZ.prototype.forEachTileCoordParentTileRange =
    function(tileCoord, callback, opt_obj, opt_tileRange) {
  var tileRange = ol.TileRange.createOrUpdate(
      0, tileCoord.x, 0, tileCoord.y, opt_tileRange);
  var z;
  for (z = tileCoord.z - 1; z >= this.minZoom; --z) {
    tileRange.minX = tileRange.maxX >>= 1;
    tileRange.minY = tileRange.maxY >>= 1;
    if (callback.call(opt_obj, z, tileRange)) {
      return true;
    }
  }
  return false;
};
