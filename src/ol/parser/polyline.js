goog.provide('ol.parser.polyline');


/**
 * Encode a list of coordinates in a flat array and return an encoded string
 *
 * @param {Array.<number>} flatPoints A flat array of coordinates.
 * @param {number=} opt_dimension The dimension of the coordinates in the array.
 * @return {string} The encoded string.
 */
ol.parser.polyline.encodeFlatCoordinates =
    function(flatPoints, opt_dimension) {
  var dimension = opt_dimension || 2;
  var i;

  var lastPoint = new Array(dimension);
  for (i = 0; i < dimension; ++i) {
    lastPoint[i] = 0;
  }

  var encoded = '', flatPointsLength = flatPoints.length;
  for (i = 0; i < flatPointsLength;) {
    for (var d = 0; d < dimension; ++d) {
      var part = Math.round(flatPoints[i++] * 1e5);
      var delta = part - lastPoint[d];
      lastPoint[d] = part;

      encoded += ol.parser.polyline.encodeSignedInteger(delta);
    }
  }

  return encoded;
};


/**
 * Decode a list of coordinates from an encoded string into a flat array
 *
 * @param {string} encoded An encoded string.
 * @param {number=} opt_dimension The dimension of the coordinates in the
 * encoded string.
 * @return {Array.<number>} A flat array of coordinates.
 */
ol.parser.polyline.decodeFlatCoordinates = function(encoded, opt_dimension) {
  var dimension = opt_dimension || 2;
  var i;

  var lastPoint = new Array(dimension);
  for (i = 0; i < dimension; ++i) {
    lastPoint[i] = 0;
  }

  var flatPoints = new Array(), encodedLength = encoded.length;
  for (i = 0; i < encodedLength;) {
    for (var d = 0; d < dimension; ++d) {
      var result = 0;
      var shift = 0;

      var b;
      do {
        b = encoded.charCodeAt(i++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      lastPoint[d] += (result & 1) ? ~(result >> 1) : (result >> 1);
      flatPoints.push(lastPoint[d] / 1e5);
    }
  }

  return flatPoints;
};


/**
 * Encode one single floating point number and return an encoded string
 *
 * @param {number} num Floating point number that should be encoded.
 * @param {number=} opt_factor The factor by which num will be multiplied.
 * The remaining decimal places will get rounded away.
 * @return {string} The encoded string.
 */
ol.parser.polyline.encodeFloat = function(num, opt_factor) {
  num = Math.round(num * (opt_factor || 1e5));
  return ol.parser.polyline.encodeSignedInteger(num);
};


/**
 * Decode one single floating point number from an encoded string
 *
 * @param {string} encoded An encoded string.
 * @param {number=} opt_factor The factor by which the result will be divided.
 * @return {number} The decoded floating point number.
 */
ol.parser.polyline.decodeFloat = function(encoded, opt_factor) {
  var result = ol.parser.polyline.decodeSignedInteger(encoded);
  return result / (opt_factor || 1e5);
};


/**
 * Encode one single signed integer and return an encoded string
 *
 * @param {number} num Signed integer that should be encoded.
 * @return {string} The encoded string.
 */
ol.parser.polyline.encodeSignedInteger = function(num) {
  var signedNum = num << 1;
  if (num < 0) {
    signedNum = ~(signedNum);
  }

  return ol.parser.polyline.encodeUnsignedInteger(signedNum);
};


/**
 * Decode one single signed integer from an encoded string
 *
 * @param {string} encoded An encoded string.
 * @return {number} The decoded signed integer.
 */
ol.parser.polyline.decodeSignedInteger = function(encoded) {
  var result = ol.parser.polyline.decodeUnsignedInteger(encoded);
  return ((result & 1) ? ~(result >> 1) : (result >> 1));
};


/**
 * Encode one single unsigned integer and return an encoded string
 *
 * @param {number} num Unsigned integer that should be encoded.
 * @return {string} The encoded string.
 */
ol.parser.polyline.encodeUnsignedInteger = function(num) {
  var value, encoded = '';
  while (num >= 0x20) {
    value = (0x20 | (num & 0x1f)) + 63;
    encoded += (String.fromCharCode(value));
    num >>= 5;
  }
  value = num + 63;
  encoded += (String.fromCharCode(value));
  return encoded;
};


/**
 * Decode one single unsigned integer from an encoded string
 *
 * @param {string} encoded An encoded string.
 * @return {number} The decoded unsigned integer.
 */
ol.parser.polyline.decodeUnsignedInteger = function(encoded) {
  var result = 0;
  var shift = 0;

  var b, i = 0;
  do {
    b = encoded.charCodeAt(i++) - 63;
    result |= (b & 0x1f) << shift;
    shift += 5;
  } while (b >= 0x20);

  return result;
};
