/**
 * @module ol/source/ImageArcGISRest
 */
import {inherits} from '../index.js';
import _ol_Image_ from '../Image.js';
import {assert} from '../asserts.js';
import _ol_events_ from '../events.js';
import EventType from '../events/EventType.js';
import {containsExtent, getHeight, getWidth} from '../extent.js';
import _ol_obj_ from '../obj.js';
import ImageSource from '../source/Image.js';
import _ol_uri_ from '../uri.js';

/**
 * @classdesc
 * Source for data from ArcGIS Rest services providing single, untiled images.
 * Useful when underlying map service has labels.
 *
 * If underlying map service is not using labels,
 * take advantage of ol image caching and use
 * {@link ol.source.TileArcGISRest} data source.
 *
 * @constructor
 * @fires ol.source.Image.Event
 * @extends {ol.source.Image}
 * @param {olx.source.ImageArcGISRestOptions=} opt_options Image ArcGIS Rest Options.
 * @api
 */
var ImageArcGISRest = function(opt_options) {

  var options = opt_options || {};

  ImageSource.call(this, {
    attributions: options.attributions,
    projection: options.projection,
    resolutions: options.resolutions
  });

  /**
   * @private
   * @type {?string}
   */
  this.crossOrigin_ =
      options.crossOrigin !== undefined ? options.crossOrigin : null;

  /**
   * @private
   * @type {boolean}
   */
  this.hidpi_ = options.hidpi !== undefined ? options.hidpi : true;

  /**
   * @private
   * @type {string|undefined}
   */
  this.url_ = options.url;

  /**
   * @private
   * @type {ol.ImageLoadFunctionType}
   */
  this.imageLoadFunction_ = options.imageLoadFunction !== undefined ?
    options.imageLoadFunction : ImageSource.defaultImageLoadFunction;


  /**
   * @private
   * @type {!Object}
   */
  this.params_ = options.params || {};

  /**
   * @private
   * @type {ol.Image}
   */
  this.image_ = null;

  /**
   * @private
   * @type {ol.Size}
   */
  this.imageSize_ = [0, 0];


  /**
   * @private
   * @type {number}
   */
  this.renderedRevision_ = 0;

  /**
   * @private
   * @type {number}
   */
  this.ratio_ = options.ratio !== undefined ? options.ratio : 1.5;

};

inherits(ImageArcGISRest, ImageSource);


/**
 * Get the user-provided params, i.e. those passed to the constructor through
 * the "params" option, and possibly updated using the updateParams method.
 * @return {Object} Params.
 * @api
 */
ImageArcGISRest.prototype.getParams = function() {
  return this.params_;
};


/**
 * @inheritDoc
 */
ImageArcGISRest.prototype.getImageInternal = function(extent, resolution, pixelRatio, projection) {

  if (this.url_ === undefined) {
    return null;
  }

  resolution = this.findNearestResolution(resolution);
  pixelRatio = this.hidpi_ ? pixelRatio : 1;

  var image = this.image_;
  if (image &&
      this.renderedRevision_ == this.getRevision() &&
      image.getResolution() == resolution &&
      image.getPixelRatio() == pixelRatio &&
      containsExtent(image.getExtent(), extent)) {
    return image;
  }

  var params = {
    'F': 'image',
    'FORMAT': 'PNG32',
    'TRANSPARENT': true
  };
  _ol_obj_.assign(params, this.params_);

  extent = extent.slice();
  var centerX = (extent[0] + extent[2]) / 2;
  var centerY = (extent[1] + extent[3]) / 2;
  if (this.ratio_ != 1) {
    var halfWidth = this.ratio_ * getWidth(extent) / 2;
    var halfHeight = this.ratio_ * getHeight(extent) / 2;
    extent[0] = centerX - halfWidth;
    extent[1] = centerY - halfHeight;
    extent[2] = centerX + halfWidth;
    extent[3] = centerY + halfHeight;
  }

  var imageResolution = resolution / pixelRatio;

  // Compute an integer width and height.
  var width = Math.ceil(getWidth(extent) / imageResolution);
  var height = Math.ceil(getHeight(extent) / imageResolution);

  // Modify the extent to match the integer width and height.
  extent[0] = centerX - imageResolution * width / 2;
  extent[2] = centerX + imageResolution * width / 2;
  extent[1] = centerY - imageResolution * height / 2;
  extent[3] = centerY + imageResolution * height / 2;

  this.imageSize_[0] = width;
  this.imageSize_[1] = height;

  var url = this.getRequestUrl_(extent, this.imageSize_, pixelRatio,
      projection, params);

  this.image_ = new _ol_Image_(extent, resolution, pixelRatio,
      url, this.crossOrigin_, this.imageLoadFunction_);

  this.renderedRevision_ = this.getRevision();

  _ol_events_.listen(this.image_, EventType.CHANGE,
      this.handleImageChange, this);

  return this.image_;

};


/**
 * Return the image load function of the source.
 * @return {ol.ImageLoadFunctionType} The image load function.
 * @api
 */
ImageArcGISRest.prototype.getImageLoadFunction = function() {
  return this.imageLoadFunction_;
};


/**
 * @param {ol.Extent} extent Extent.
 * @param {ol.Size} size Size.
 * @param {number} pixelRatio Pixel ratio.
 * @param {ol.proj.Projection} projection Projection.
 * @param {Object} params Params.
 * @return {string} Request URL.
 * @private
 */
ImageArcGISRest.prototype.getRequestUrl_ = function(extent, size, pixelRatio, projection, params) {
  // ArcGIS Server only wants the numeric portion of the projection ID.
  var srid = projection.getCode().split(':').pop();

  params['SIZE'] = size[0] + ',' + size[1];
  params['BBOX'] = extent.join(',');
  params['BBOXSR'] = srid;
  params['IMAGESR'] = srid;
  params['DPI'] = Math.round(90 * pixelRatio);

  var url = this.url_;

  var modifiedUrl = url
      .replace(/MapServer\/?$/, 'MapServer/export')
      .replace(/ImageServer\/?$/, 'ImageServer/exportImage');
  if (modifiedUrl == url) {
    assert(false, 50); // `options.featureTypes` should be an Array
  }
  return _ol_uri_.appendParams(modifiedUrl, params);
};


/**
 * Return the URL used for this ArcGIS source.
 * @return {string|undefined} URL.
 * @api
 */
ImageArcGISRest.prototype.getUrl = function() {
  return this.url_;
};


/**
 * Set the image load function of the source.
 * @param {ol.ImageLoadFunctionType} imageLoadFunction Image load function.
 * @api
 */
ImageArcGISRest.prototype.setImageLoadFunction = function(imageLoadFunction) {
  this.image_ = null;
  this.imageLoadFunction_ = imageLoadFunction;
  this.changed();
};


/**
 * Set the URL to use for requests.
 * @param {string|undefined} url URL.
 * @api
 */
ImageArcGISRest.prototype.setUrl = function(url) {
  if (url != this.url_) {
    this.url_ = url;
    this.image_ = null;
    this.changed();
  }
};


/**
 * Update the user-provided params.
 * @param {Object} params Params.
 * @api
 */
ImageArcGISRest.prototype.updateParams = function(params) {
  _ol_obj_.assign(this.params_, params);
  this.image_ = null;
  this.changed();
};
export default ImageArcGISRest;
